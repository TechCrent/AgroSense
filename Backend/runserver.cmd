@echo off
REM Use Pipenv's virtualenv (plain "python" would miss Django).
cd /d "%~dp0"
pipenv run python manage.py runserver %*
