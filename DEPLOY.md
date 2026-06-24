# Руководство по развертыванию taskmanager2026.ru

Это руководство предполагает, что у вас есть сервер (VPS) с Ubuntu/Debian и вы уже купили домен `taskmanager2026.ru`.

## 1. Подготовка сервера
Подключитесь к серверу по SSH:
```bash
ssh root@ваш_ip_сервера
```

Установите Docker и Docker Compose, если они еще не установлены:
```bash
apt update
apt install -y docker.io docker-compose-plugin
```

## 2. Загрузка файлов проекта
Вам нужно перенести файлы с вашего компьютера на сервер. Можно использовать `scp` или `FileZilla`.
Скопируйте всю папку `task_manager` на сервер, например, в `/root/task_manager`.

**Важные файлы для загрузки:**
- `backend/`
- `frontend/`
- `docker-compose.prod.yml`
- `requirements.txt` (если есть в корне)

## 3. Запуск (Deploy)
На сервере перейдите в папку проекта:
```bash
cd /root/task_manager
```

Установите секретный ключ (замените значение на ваш настоящий сложный пароль):
```bash
export SECRET_KEY='ваш-очень-сложный-секретный-ключ'
```

Запустите Docker Compose, используя файл для продакшена:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 4. Проверка
Откройте [https://taskmanager2026.ru](https://taskmanager2026.ru) в браузере.

## Если что-то не работает
Посмотрите логи:
```bash
docker compose -f docker-compose.prod.yml logs -f
```
