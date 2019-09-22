
SSH_USER=$(grep SSH_USER .env | cut -d '=' -f2)
SSH_HOST=$(grep SSH_HOST .env | cut -d '=' -f2)
SSH_PATH=$(grep SSH_PATH .env | cut -d '=' -f2)
SSH_PASSWORD_FILE=$(grep SSH_PASSWORD_FILE .env | cut -d '=' -f2)

sshpass -v -f $SSH_PASSWORD_FILE rsync -av ./dist/ $SSH_USER@$SSH_HOST:$SSH_PATH --delete --exclude-from .rsyncignore