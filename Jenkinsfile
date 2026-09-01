pipeline {

    agent any

    environment {
        BACKEND_IMAGE  = 'manaskumar1/homeware-backend'
        FRONTEND_IMAGE = 'manaskumar1/homeware-frontend'
        WORKER_HOST    = '20.40.58.197'
        WORKER_USER    = 'manas'
        APP_DIR        = '/home/manas/homeware'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    docker build \
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                    docker build \
                        --build-arg VITE_API_BASE=/api \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                '''
            }
        }

        stage('Push Images') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            --username "$DOCKER_USERNAME" \
                            --password-stdin

                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${BACKEND_IMAGE}:latest

                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Worker') {
            steps {
                sshagent(['worker-ssh-key']) {

                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            ${WORKER_USER}@${WORKER_HOST} \
                            "cd ${APP_DIR} && \
                             docker compose -f docker-compose.prod.yml pull && \
                             docker compose -f docker-compose.prod.yml up -d"
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sshagent(['worker-ssh-key']) {

                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            ${WORKER_USER}@${WORKER_HOST} \
                            "cd ${APP_DIR} && \
                             docker compose -f docker-compose.prod.yml ps"
                    '''

                    sh '''
                        sleep 10

                        curl --fail \
                            --max-time 10 \
                            http://${WORKER_HOST}/
                    '''
                }
            }
        }
    }

    post {

        success {
            echo 'CI/CD deployment successful.'
            echo 'The new version is live on the worker server.'
        }

        failure {
            echo 'CI/CD deployment failed.'
            echo 'Check the Jenkins console output for details.'
        }
    }
}
