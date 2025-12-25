#!/bin/bash

# 통합 운세 서비스 빠른 시작 스크립트

echo "======================================"
echo "🔮 심리상담 과 운세보기"
echo "======================================"

# 1. logs 폴더 생성
if [ ! -d "logs" ]; then
    echo "📁 logs 폴더 생성 중..."
    mkdir -p logs
    echo "✅ logs 폴더 생성 완료"
fi

# 2. templates 폴더 확인
if [ ! -d "templates" ]; then
    echo "⚠️  templates 폴더가 없습니다!"
    echo "   main_menu.html, 404.html, 500.html 파일을 templates/ 폴더에 넣어주세요."
    exit 1
fi

# 3. 필수 파일 확인
REQUIRED_FILES=("main_app.py" "app.py" "mans_app.py" "y6_app.py" "tarot_app.py" "toj_app.py" "saju_app.py")

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ $file 파일이 없습니다!"
        exit 1
    fi
done

echo "✅ 모든 필수 파일 확인 완료"

# 4. 가상환경 확인
if [ -d "venv" ]; then
    echo "🐍 가상환경 활성화 중..."
    source venv/bin/activate
    echo "✅ 가상환경 활성화 완료"
else
    echo "⚠️  가상환경이 없습니다. 시스템 Python을 사용합니다."
fi

# 5. 실행 모드 선택
echo ""
echo "실행 모드를 선택하세요:"
echo "1) 개발 모드 (python main_app.py)"
echo "2) 프로덕션 모드 (gunicorn)"
echo "3) 백그라운드 실행 (nohup + gunicorn)"
read -p "선택 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "======================================"
        echo "🔧 개발 모드로 시작합니다..."
        echo "======================================"
        python main_app.py
        ;;
    2)
        echo ""
        echo "======================================"
        echo "🚀 프로덕션 모드로 시작합니다..."
        echo "======================================"
        if command -v gunicorn &> /dev/null; then
            gunicorn -c gunicorn_config.py wsgi:application
        else
            echo "❌ gunicorn이 설치되지 않았습니다!"
            echo "   설치: pip install gunicorn"
            exit 1
        fi
        ;;
    3)
        echo ""
        echo "======================================"
        echo "🌙 백그라운드로 시작합니다..."
        echo "======================================"
        if command -v gunicorn &> /dev/null; then
            nohup gunicorn -c gunicorn_config.py wsgi:application > logs/gunicorn.log 2>&1 &
            PID=$!
            echo "✅ 백그라운드 실행 완료 (PID: $PID)"
            echo "📋 로그: tail -f logs/gunicorn.log"
            echo "🛑 중지: kill $PID"
        else
            echo "❌ gunicorn이 설치되지 않았습니다!"
            echo "   설치: pip install gunicorn"
            exit 1
        fi
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac
