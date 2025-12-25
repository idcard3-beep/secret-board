#!/bin/bash

# 통합 운세 서비스 중지 스크립트

echo "======================================"
echo "🛑 서비스 중지 중..."
echo "======================================"

# Gunicorn 프로세스 찾기
PIDS=$(ps aux | grep '[g]unicorn.*wsgi:application' | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "⚠️  실행 중인 서비스가 없습니다."
    exit 0
fi

# 프로세스 종료
echo "발견된 프로세스:"
ps aux | grep '[g]unicorn.*wsgi:application'
echo ""

for PID in $PIDS; do
    echo "🔪 PID $PID 종료 중..."
    kill $PID
done

sleep 2

# 강제 종료 확인
REMAINING=$(ps aux | grep '[g]unicorn.*wsgi:application' | awk '{print $2}')
if [ ! -z "$REMAINING" ]; then
    echo "⚠️  일부 프로세스가 남아있습니다. 강제 종료합니다..."
    for PID in $REMAINING; do
        kill -9 $PID
    done
fi

echo "✅ 서비스 중지 완료"
