pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_USER     = 'your_docker_hub_username' // <-- CHANGE THIS
        IMAGE_TAG       = "${BUILD_NUMBER}"
        EC2_USER        = 'ubuntu'
        EC2_IP          = '3.110.105.87'
        SSH_CREDENTIAL  = 'ec2-ssh-key'
        REGISTRY_CRED   = 'docker-hub-credentials'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Security & Syntax Lint') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        sh 'node --check backend/src/server.js'
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        sh 'test -f frontend/package.json'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${DOCKER_USER}/college-backend:${IMAGE_TAG} ./backend"
                sh "docker build -t ${DOCKER_USER}/college-frontend:${IMAGE_TAG} ./frontend"
                sh "docker build -t ${DOCKER_USER}/college-nginx:${IMAGE_TAG} ./nginx"
                sh "docker tag ${DOCKER_USER}/college-backend:${IMAGE_TAG} ${DOCKER_USER}/college-backend:latest"
                sh "docker tag ${DOCKER_USER}/college-frontend:${IMAGE_TAG} ${DOCKER_USER}/college-frontend:latest"
                sh "docker tag ${DOCKER_USER}/college-nginx:${IMAGE_TAG} ${DOCKER_USER}/college-nginx:latest"
            }
        }

        stage('Vulnerability Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL --light ${DOCKER_USER}/college-backend:${IMAGE_TAG} || true"
            }
        }

        stage('Push to Registry') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${REGISTRY_CRED}", usernameVariable: 'HUB_USER', passwordVariable: 'HUB_PASS')]) {
                    sh 'echo $HUB_PASS | docker login -u $HUB_USER --password-stdin'
                    sh "docker push ${DOCKER_USER}/college-backend:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/college-frontend:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/college-nginx:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/college-backend:latest"
                    sh "docker push ${DOCKER_USER}/college-frontend:latest"
                    sh "docker push ${DOCKER_USER}/college-nginx:latest"
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                sshagent(credentials: ["${SSH_CREDENTIAL}"]) {
                    sh "ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'mkdir -p ~/college-app/db'"
                    sh "scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${EC2_USER}@${EC2_IP}:~/college-app/docker-compose.yml"
                    sh "scp -o StrictHostKeyChecking=no db/init.sql ${EC2_USER}@${EC2_IP}:~/college-app/db/init.sql"
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} '
                            cd ~/college-app
                            docker compose pull
                            export IMAGE_TAG=${IMAGE_TAG}
                            docker compose up -d --remove-orphans
                            docker image prune -f
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline succeeded! Build #${BUILD_NUMBER} deployed successfully."
        }
        failure {
            echo "CI/CD Pipeline failed at some stage. Check Jenkins console logs."
        }
    }
}
