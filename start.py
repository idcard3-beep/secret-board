#!/usr/bin/env python3
"""
Render.com용 Flask 애플리케이션 시작 스크립트
"""
import os
from app import app

if __name__ == "__main__":
    # Render.com은 PORT 환경변수를 통해 포트를 지정
    port = int(os.environ.get("PORT", 5000))
    # 프로덕션 환경에서는 host를 0.0.0.0으로 설정
    app.run(host="0.0.0.0", port=port, debug=False)