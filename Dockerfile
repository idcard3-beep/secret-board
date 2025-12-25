# Python 3.11 슬림 이미지 사용
FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt 복사 및 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 프로젝트 파일 복사
COPY . .

# 필요한 디렉토리 생성
RUN mkdir -p logs uploads/images uploads/sign_file

# 로그 및 업로드 디렉토리 권한 설정
RUN chmod -R 755 logs uploads

# 환경 변수 설정
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=5000

# 포트 노출
EXPOSE 5000

# Gunicorn으로 애플리케이션 실행
CMD ["gunicorn", "--config", "gunicorn_config.py", "wsgi:application"]

