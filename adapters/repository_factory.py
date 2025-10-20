"""
Repository Factory
Excel, MSSQL, 또는 PostgreSQL Repository를 환경 설정에 따라 동적으로 선택
"""
import os
from config.settings import STORAGE

def get_repository():
    """환경 설정에 따라 적절한 Repository 인스턴스를 반환"""
    
    if STORAGE == "POSTGRESQL":
        from adapters.postgresql_repo import PostgreSQLRepo
        return PostgreSQLRepo()
    
    elif STORAGE == "MSSQL":
        from adapters.mssql_repo import MSSQLRepository
        from config.settings import MSSQL_DRIVER, MSSQL_SERVER, MSSQL_DB, MSSQL_USER, MSSQL_PWD
        
        # MSSQL 연결 문자열 생성 (Windows 인증 사용)
        if MSSQL_USER and MSSQL_PWD:
            # SQL Server 인증
            conn_str = (
                f"DRIVER={{{MSSQL_DRIVER}}};"
                f"SERVER={MSSQL_SERVER};"
                f"DATABASE={MSSQL_DB};"
                f"UID={MSSQL_USER};"
                f"PWD={MSSQL_PWD};"
                "TrustServerCertificate=yes;"
            )
        else:
            # Windows 인증
            conn_str = (
                f"DRIVER={{{MSSQL_DRIVER}}};"
                f"SERVER={MSSQL_SERVER};"
                f"DATABASE={MSSQL_DB};"
                "Trusted_Connection=yes;"
                "TrustServerCertificate=yes;"
            )
        
        print(f"🔗 MSSQL Repository 초기화 중...")
        print(f"📡 서버: {MSSQL_SERVER}")
        print(f"🗃️ 데이터베이스: {MSSQL_DB}")
        print(f"� 사용자: {MSSQL_USER}")
        print(f"�🔐 인증: {'SQL Server' if MSSQL_USER else 'Windows'}")
        print(f"🔗 연결 문자열: {conn_str}")
        
        return MSSQLRepository(conn_str)
    
    else:  # Default to Excel
        from adapters.excel_repo import ExcelRepository
        print(f"📊 Excel Repository 초기화 중...")
        return ExcelRepository()

# 별칭 함수 (하위 호환성)
def create_repository():
    """get_repository()의 별칭"""
    return get_repository()