from os import getenv

TIMEZONE = getenv('TIMEZONE', 'Asia/Tehran')

DATABASE = {
    'host': getenv('DB_HOST', 'localhost'),
    'port': int(getenv('DB_PORT', 27017)),
    'name': getenv('DB_NAME', 'taqche')
}