pipeline {

    agent {
        label 'worker1'
    }

    environment {
        BACKEND_IMAGE = 'manaskumar1/homeware-backend'
        FRONTEND_IMAGE = 'manaskumar1/homeware-frontend'
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

        stage('Push to Docker Hub') {
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

        stage('Deploy') {
            steps {
                sh '''
                    cd /home/manas/homeware

                    docker compose \
                        -f docker-compose.prod.yml \
                        pull

                    docker compose \
                        -f docker-compose.prod.yml \
                        up -d
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    cd /home/manas/homeware

                    docker compose \
                        -f docker-compose.prod.yml \
                        ps

                    curl --fail \
                        http://localhost:3000/api/health
                '''
            }
        }
    }

    post {

        success {
            echo 'CI/CD deployment successful.'
        }

        failure {
            echo 'CI/CD deployment failed.'
        }
    }
}
