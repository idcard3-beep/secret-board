import psycopg2
import psycopg2.extras
from urllib.parse import urlparse
import os
import uuid
from datetime import datetime

class PostgreSQLRepo:
    """PostgreSQL 데이터베이스 레포지토리 (새 스키마 + 하위 호환성)"""
    
    def __init__(self):
        # ⚠️ 중요: cloudtype.io 서버 정보만 하드코딩하여 사용 (환경 변수 완전 무시)
        # 이전 Render.com 서버로 절대 연결되지 않도록 하드코딩
        self.conn_params = {
            'host': 'svc.sel3.cloudtype.app',  # cloudtype.io 서버만 사용
            'port': 32624,  # cloudtype.io 포트만 사용
            'database': 'secretboard',
            'user': 'secretboard_user',
            'password': 'xToIsayLLO9nFmeiAPChiF96d3khj8Eq'
        }
        
        # 환경 변수 확인 (디버깅용)
        env_db_url = os.getenv("DATABASE_URL", "")
        if env_db_url and "singapore-postgres.render.com" in env_db_url:
            print("⚠️⚠️⚠️ 경고: 환경 변수에 이전 서버 정보가 있지만 무시하고 cloudtype.io 서버만 사용합니다!")
        
        print(f"[INIT] PostgreSQL 연결 설정 (cloudtype.io 서버 - 하드코딩):")
        print(f"       Host: {self.conn_params['host']} (환경 변수 무시)")
        print(f"       Port: {self.conn_params['port']} (환경 변수 무시)")  
        print(f"       Database: {self.conn_params['database']}")
        print(f"       User: {self.conn_params['user']}")
        print(f"       Password: {'*' * len(str(self.conn_params['password']))}")
    
    def _parse_database_url(self):
        """DATABASE_URL 환경변수를 파싱하여 연결 정보 추출 - cloudtype.io 서버만 사용"""
        # cloudtype.io 서버 정보로 무조건 설정
        cloudtype_db_url = "postgresql://secretboard_user:xToIsayLLO9nFmeiAPChiF96d3khj8Eq@svc.sel3.cloudtype.app:32624/secretboard"
        
        # 환경 변수에 cloudtype.io 서버 정보 설정
        os.environ["DATABASE_URL"] = cloudtype_db_url
        
        # cloudtype.io 서버 정보 파싱
        result = urlparse(cloudtype_db_url)
        
        # 포트 처리: 정수로 변환
        port = result.port
        if port is None:
            port = 32624
        elif isinstance(port, str):
            port = int(port)
        
        parsed_config = {
            'host': result.hostname,  # svc.sel3.cloudtype.app
            'port': port,  # 32624
            'database': result.path[1:] if result.path else "secretboard",
            'user': result.username or "secretboard_user",
            'password': result.password or "xToIsayLLO9nFmeiAPChiF96d3khj8Eq"
        }
        
        print(f"✅ cloudtype.io 서버 연결 정보 설정 완료")
        print(f"📋 연결 정보: host={parsed_config['host']}, port={parsed_config['port']}, db={parsed_config['database']}, user={parsed_config['user']}")
        return parsed_config
    
    def _get_connection(self):
        """데이터베이스 연결 생성 - cloudtype.io 서버만 사용"""
        # ⚠️ 중요: 절대 이전 Render.com 서버로 연결하지 않도록 하드코딩
        # 환경 변수나 다른 설정을 완전히 무시하고 cloudtype.io만 사용
        cloudtype_conn_params = {
            'host': 'svc.sel3.cloudtype.app',  # cloudtype.io 서버만 사용
            'port': 32624,  # cloudtype.io 포트만 사용
            'database': 'secretboard',
            'user': 'secretboard_user',
            'password': 'xToIsayLLO9nFmeiAPChiF96d3khj8Eq'
        }
        
        # 이전 서버 정보 감지 시 경고
        env_db_url = os.getenv("DATABASE_URL", "")
        if env_db_url and ("singapore-postgres.render.com" in env_db_url or "dpg-d3nhsdadbo4c73d0dehg-a" in env_db_url):
            print("=" * 80)
            print("⚠️⚠️⚠️ 경고: 환경 변수에 이전 Render.com 서버 정보가 있지만 무시합니다!")
            print(f"   환경 변수 DATABASE_URL: {env_db_url[:50]}...")
            print("   cloudtype.io 서버만 사용합니다!")
            print("=" * 80)
        
        try:
            print(f"[DB CONN] =========================================")
            print(f"[DB CONN] cloudtype.io 서버 연결 시도")
            print(f"[DB CONN] Host: {cloudtype_conn_params['host']}")
            print(f"[DB CONN] Port: {cloudtype_conn_params['port']}")
            print(f"[DB CONN] Database: {cloudtype_conn_params['database']}")
            print(f"[DB CONN] User: {cloudtype_conn_params['user']}")
            print(f"[DB CONN] 실제 연결 파라미터:")
            print(f"[DB CONN]   - host: {cloudtype_conn_params.get('host')}")
            print(f"[DB CONN]   - port: {cloudtype_conn_params.get('port')}")
            print(f"[DB CONN]   - database: {cloudtype_conn_params.get('database')}")
            print(f"[DB CONN] =========================================")
            
            # 실제로 전달되는 파라미터 최종 검증
            print(f"[DB CONN] 최종 검증 - 전달할 파라미터:")
            for key, value in cloudtype_conn_params.items():
                if key == 'password':
                    print(f"   {key}: {'*' * len(str(value))}")
                else:
                    print(f"   {key}: {value}")
            
            # render.com 서버 정보가 있는지 확인
            for key, value in cloudtype_conn_params.items():
                val_str = str(value)
                if "render.com" in val_str or "singapore-postgres" in val_str or "dpg-d3nhsdadbo4c73d0dehg-a" in val_str:
                    print(f"[DB CONN] ❌❌❌ 치명적 오류: {key}에 render.com 정보가 있습니다: {val_str}")
                    raise Exception(f"치명적 오류: {key} 파라미터에 render.com 서버 정보가 포함되어 있습니다!")
            
            import sys
            print(f"[DB CONN] Python 버전: {sys.version.split()[0]}")
            
            # 연결 시도 전에 환경 변수 완전히 무시하는지 확인
            print(f"[DB CONN] psycopg2.connect() 호출 직전...")
            
            # 혹시 모를 환경 변수 사용 방지를 위해 명시적으로만 파라미터 전달
            # DATABASE_URL 환경 변수를 임시로 삭제
            old_db_url = os.environ.pop("DATABASE_URL", None)
            if old_db_url and ("render.com" in old_db_url or "singapore-postgres" in old_db_url):
                print(f"[DB CONN] ⚠️ DATABASE_URL 환경 변수를 임시로 삭제했습니다: {old_db_url[:50]}...")
            
            try:
                print(f"[DB CONN] psycopg2.connect() 호출 중 (환경 변수 무시)...")
                conn = psycopg2.connect(
                    host=cloudtype_conn_params['host'],
                    port=cloudtype_conn_params['port'],
                    database=cloudtype_conn_params['database'],
                    user=cloudtype_conn_params['user'],
                    password=cloudtype_conn_params['password']
                )
            finally:
                # 환경 변수 복원 (다른 코드에 영향을 주지 않기 위해)
                if old_db_url:
                    os.environ["DATABASE_URL"] = old_db_url
            print("[DB CONN] ✅ cloudtype.io 서버 연결 성공")
            
            # 연결 정보 확인
            with conn.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0]
                print(f"[DB CONN] 연결된 PostgreSQL 버전: {version[:50]}...")
                if "render.com" in version.lower() or "singapore" in version.lower():
                    print(f"[DB CONN] ❌❌❌ 경고: 연결된 서버가 render.com인 것 같습니다!")
            
            return conn
        except psycopg2.Error as e:
            error_str = str(e)
            print(f"[DB CONN] ❌ psycopg2.Error 발생:")
            print(f"   에러 메시지: {error_str}")
            
            # render.com 관련 에러인지 확인
            if "render.com" in error_str or "singapore-postgres" in error_str or "dpg-d3nhsdadbo4c73d0dehg-a" in error_str:
                print("=" * 80)
                print("[DB CONN] ❌❌❌ 치명적 오류: render.com 서버로 연결하려고 했습니다!")
                print(f"   에러: {error_str}")
                print("   이것은 _get_connection()이 올바른 파라미터를 사용하지 않았음을 의미합니다!")
                print("   전달된 파라미터를 다시 확인하세요!")
                print("=" * 80)
                
                # 스택 트레이스 출력
                import traceback
                traceback.print_exc()
                
                raise Exception(f"치명적 오류: render.com 서버로 연결 시도됨. 전달된 파라미터: {cloudtype_conn_params}")
            
            error_msg = f"cloudtype.io 서버 연결 실패: {error_str}"
            if hasattr(e, 'pgcode'):
                error_msg += f" (오류 코드: {e.pgcode})"
            if hasattr(e, 'pgerror'):
                error_msg += f" (상세: {e.pgerror})"
            print(f"[DB CONN] ❌ {error_msg}")
            import traceback
            traceback.print_exc()
            raise Exception(error_msg) from e
        except Exception as e:
            error_str = str(e)
            print(f"[DB CONN] ❌ 예상치 못한 오류: {error_str}")
            if "render.com" in error_str or "singapore-postgres" in error_str:
                print("[DB CONN] ❌❌❌ render.com 관련 오류가 감지되었습니다!")
            import traceback
            traceback.print_exc()
            raise
    
    def _ensure_tables_exist(self):
        """테이블이 존재하지 않으면 생성 (간소화된 체크)"""
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    # tickets 테이블 존재 확인
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = 'tickets'
                        )
                    """)
                    
                    exists = cursor.fetchone()[0]
                    if not exists:
                        print("⚠️  tickets 테이블이 존재하지 않습니다. reset_pg_tables.py를 먼저 실행하세요.")
                        return False
                    
                    print("✅ tickets 테이블 존재 확인 완료")
                    return True
        except psycopg2.Error as db_error:
            print(f"❌ 테이블 존재 확인 중 데이터베이스 오류: {db_error}")
            import traceback
            traceback.print_exc()
            return False
        except Exception as e:
            print(f"❌ 테이블 존재 확인 중 오류: {e}")
            import traceback
            traceback.print_exc()
            return False

    # ===========================================
    # 기존 인터페이스 호환 메서드들 (웹 애플리케이션용)
    # ===========================================
    
    def list_tickets(self, snsgu=None, smember_id=None):
        """기존 인터페이스 호환: 티켓 목록 조회"""
        return self.get_tickets(snsgu=snsgu, smember_id=smember_id)
    
    def create_ticket(self, ticket_data):
        """기존 인터페이스 호환: 딕셔너리 형태의 티켓 데이터를 받아서 처리"""
        if not isinstance(ticket_data, dict):
            raise ValueError("create_ticket에는 딕셔너리 형태의 ticket_data가 필요합니다")
        
        # 딕셔너리에서 필요한 필드 추출
        title = ticket_data.get('title', '')
        content = ticket_data.get('content', '')
        password_hash = ticket_data.get('post_pwd_hash') or ticket_data.get('password_hash', '')
        
        # 추가 필드들
        kwargs = {
            'author_name': ticket_data.get('author_name'),
            'author_nickname': ticket_data.get('author_nickname'),
            'author_contact': ticket_data.get('author_contact'),
            'author_phone': ticket_data.get('author_phone'),
            'author_mobile': ticket_data.get('author_mobile'),  # 스키마에 있는 컬럼 추가
            'author_email': ticket_data.get('author_email'),
            'author_gender': ticket_data.get('author_gender'),
            'birth_year': ticket_data.get('birth_year'),
            'birth_datetime': ticket_data.get('birth_datetime'),  # 생년월일시 추가
            'birth_hour': ticket_data.get('birth_hour'),  # 출생 시간 추가
            'birth_minute': ticket_data.get('birth_minute'),  # 출생 분 추가
            'calendar_type': ticket_data.get('calendar_type'),  # 역법 추가
            'yundal': ticket_data.get('yundal'),  # 윤달 추가
            'hour_ji': ticket_data.get('hour_ji'),  # 시주 추가
            'content_enc': ticket_data.get('content_enc'),  # 암호화된 내용 추가
            'snsgu': ticket_data.get('snsgu', 'A0001'),  # 기본값 추가
            'smember_id': ticket_data.get('smember_id') or ticket_data.get('sMember_id'),  # 회원 ID 추가 (대소문자 모두 지원)
            'admin_id': ticket_data.get('admin_id'),  # 관리자 ID 추가
            'ti_role': ticket_data.get('ti_role'),  # 관리자 role 추가
            'choice1': ticket_data.get('choice1', 0),
            'choice2': ticket_data.get('choice2', 0),
            'choice3': ticket_data.get('choice3', 0),
            'choice4': ticket_data.get('choice4', 0),
            'choice5': ticket_data.get('choice5', 0),
            'choice6': ticket_data.get('choice6', 0),
            'choice7': ticket_data.get('choice7', 0),
            'choice8': ticket_data.get('choice8', 0),
            'choice9': ticket_data.get('choice9', 0),
            'choice10': ticket_data.get('choice10', 0),
            'choice11': ticket_data.get('choice11', 0),
            'choice12': ticket_data.get('choice12', 0),
            'agreement': ticket_data.get('agreement', 0),
            'time_input_type': ticket_data.get('time_input_type', 'time')  # 스키마에 NOT NULL이므로 기본값 필요
        }
        
        # 디버깅: kwargs에 포함된 값 확인
        print(f"📊 create_ticket kwargs 준비 완료")
        print(f"   smember_id: {kwargs.get('smember_id')}")
        print(f"   admin_id: {kwargs.get('admin_id')}")
        print(f"   ti_role: {kwargs.get('ti_role')}")
        
        return self._create_ticket_internal(title, content, password_hash, **kwargs)
    
    def get_ticket(self, ticket_id):
        """기존 인터페이스 호환: get_ticket_by_id()의 래퍼"""
        return self.get_ticket_by_id(ticket_id)
    
    def update_ticket(self, ticket_id, data):
        """기존 인터페이스 호환: 딕셔너리 형태의 data를 받아서 처리"""
        if isinstance(data, dict):
            # 모든 필드를 kwargs로 전달
            return self._update_ticket_internal(ticket_id, **data)
        else:
            raise ValueError("update_ticket에는 딕셔너리 형태의 data가 필요합니다")
    
    def list_messages(self, ticket_id):
        """기존 인터페이스 호환: get_messages_by_ticket()의 래퍼"""
        return self.get_messages_by_ticket(ticket_id)
    
    def create_message(self, message_data):
        """기존 인터페이스 호환: 딕셔너리 형태의 메시지 데이터를 받아서 처리"""
        if isinstance(message_data, dict):
            ticket_id = message_data.get('ticket_id')
            content = message_data.get('content', '')
            role = message_data.get('role', 'USER')
            admin_id = message_data.get('admin_id')  # admin_id 추가
            return self._create_message_internal(ticket_id, content, role, admin_id)
        else:
            raise ValueError("create_message에는 딕셔너리 형태의 message_data가 필요합니다")
    
    def mark_has_admin_reply(self, ticket_id):
        """기존 인터페이스 호환: 관리자 답변 표시 및 상태 업데이트"""
        print(f"🔄 mark_has_admin_reply 호출 - ticket_id: {ticket_id} (타입: {type(ticket_id)})")
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # UUID 형식으로 업데이트 시도
                print(f"🔄 UUID 형식으로 업데이트 시도: {ticket_id}")
                cursor.execute("""
                    UPDATE tickets 
                    SET has_admin_reply = TRUE, 
                        status = 'ANSWERED',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = %s::uuid
                """, (str(ticket_id),))
                
                rows_affected_uuid = cursor.rowcount
                print(f"� UUID 매칭으로 업데이트된 행 수: {rows_affected_uuid}")
                
                # UUID로 업데이트되지 않았다면 문자열 매칭 시도
                if rows_affected_uuid == 0:
                    print(f"� 문자열 매칭으로 재시도")
                    cursor.execute("""
                        UPDATE tickets 
                        SET has_admin_reply = TRUE, 
                            status = 'ANSWERED',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE ticket_id::text = %s
                    """, (str(ticket_id),))
                    
                    rows_affected_string = cursor.rowcount
                    print(f"📊 문자열 매칭으로 업데이트된 행 수: {rows_affected_string}")
                    
                    if rows_affected_string == 0:
                        print(f"❌ 어떤 방법으로도 업데이트되지 않음!")
                        # 티켓 존재 여부 확인
                        cursor.execute("SELECT ticket_id::text, status FROM tickets WHERE ticket_id::text LIKE %s", (f"%{str(ticket_id)[-8:]}%",))
                        similar = cursor.fetchall()
                        print(f"🔍 유사한 티켓들: {similar}")
                
                conn.commit()
                
                # 최종 상태 확인
                cursor.execute("""
                    SELECT status, has_admin_reply 
                    FROM tickets 
                    WHERE ticket_id = %s::uuid OR ticket_id::text = %s
                """, (str(ticket_id), str(ticket_id)))
                
                final_result = cursor.fetchone()
                if final_result:
                    print(f"✅ 최종 상태: status={final_result[0]}, has_admin_reply={final_result[1]}")
                    if final_result[0] != 'ANSWERED':
                        print(f"❌ 심각한 오류: 상태가 여전히 ANSWERED가 아님!")
                else:
                    print(f"❌ 최종 확인에서도 티켓을 찾을 수 없음!")
                
                print(f"✅ mark_has_admin_reply 완료")

    # ===========================================
    # 내부 구현 메서드들 (새 스키마 적용)
    # ===========================================
    
    def _create_ticket_internal(self, title, content, password_hash, **kwargs):
        """내부용 티켓 생성 메서드"""
        try:
            print(f"🔍 _create_ticket_internal 시작")
            print(f"   title: {title[:50] if title else None}...")
            print(f"   content 길이: {len(content) if content else 0}")
            print(f"   password_hash: {'있음' if password_hash else '없음'}")
            print(f"   kwargs keys: {list(kwargs.keys())}")
            
            if not self._ensure_tables_exist():
                raise Exception("테이블이 존재하지 않습니다")
            
            print(f"🔗 데이터베이스 연결 시도...")
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    # 기본 필드들
                    ticket_data = {
                        'title_masked': title,
                        'content_enc': kwargs.get('content_enc') or content,  # content_enc 우선 사용
                        'post_pwd_hash': password_hash,
                        'author_name': kwargs.get('author_name'),
                        'author_nickname': kwargs.get('author_nickname'),
                        'author_contact': kwargs.get('author_contact'),
                        'author_phone': kwargs.get('author_phone'),
                        'author_mobile': kwargs.get('author_mobile'),  # 스키마에 있는 컬럼 추가
                        'author_email': kwargs.get('author_email'),
                        'author_gender': kwargs.get('author_gender'),
                        'birth_year': kwargs.get('birth_year'),
                        'birth_datetime': kwargs.get('birth_datetime'),  # 생년월일시 추가
                        'birth_hour': kwargs.get('birth_hour'),  # 출생 시간 추가
                        'birth_minute': kwargs.get('birth_minute'),  # 출생 분 추가
                        'calendar_type': kwargs.get('calendar_type'),  # 역법 추가
                        'yundal': kwargs.get('yundal'),  # 윤달 추가
                        'hour_ji': kwargs.get('hour_ji'),  # 시주 추가
                        'snsgu': kwargs.get('snsgu', 'A0001'),  # 기본값 추가
                        'smember_id': kwargs.get('smember_id') or kwargs.get('sMember_id'),  # 회원 ID 추가 (대소문자 모두 지원)
                        'admin_id': kwargs.get('admin_id'),  # 관리자 ID 추가
                        'ti_role': kwargs.get('ti_role'),  # 관리자 role 추가
                        'choice1': kwargs.get('choice1', 0),
                        'choice2': kwargs.get('choice2', 0),
                        'choice3': kwargs.get('choice3', 0),
                        'choice4': kwargs.get('choice4', 0),
                        'choice5': kwargs.get('choice5', 0),
                        'choice6': kwargs.get('choice6', 0),
                        'choice7': kwargs.get('choice7', 0),
                        'choice8': kwargs.get('choice8', 0),
                        'choice9': kwargs.get('choice9', 0),
                        'choice10': kwargs.get('choice10', 0),
                        'choice11': kwargs.get('choice11', 0),
                        'choice12': kwargs.get('choice12', 0),
                        'agreement': kwargs.get('agreement', 0),
                        'time_input_type': kwargs.get('time_input_type', 'time')  # 스키마에 NOT NULL이므로 기본값 필요
                    }
                    
                    print(f"📊 ticket_data 준비 완료")
                    print(f"   smember_id: {ticket_data.get('smember_id')}")
                    print(f"   admin_id: {ticket_data.get('admin_id')}")
                    print(f"   ti_role: {ticket_data.get('ti_role')}")
                    print(f"   snsgu: {ticket_data.get('snsgu')}")
                    print(f"   agreement: {ticket_data.get('agreement')}")
                    print(f"   birth_datetime: {ticket_data.get('birth_datetime')}")
                    print(f"   birth_hour: {ticket_data.get('birth_hour')}")
                    print(f"   birth_minute: {ticket_data.get('birth_minute')}")
                    print(f"   calendar_type: {ticket_data.get('calendar_type')}")
                    print(f"   yundal: {ticket_data.get('yundal')}")
                    print(f"   hour_ji: {ticket_data.get('hour_ji')}")
                    
                    print(f"📝 SQL INSERT 실행 중...")
                    cursor.execute("""
                        INSERT INTO tickets (
                            title_masked, content_enc, post_pwd_hash,
                            author_name, author_nickname, author_contact,
                            author_phone, author_mobile, author_email, author_gender,
                            birth_year, birth_datetime, birth_hour, birth_minute,
                            calendar_type, yundal, hour_ji,
                            snsgu, smember_id, admin_id, ti_role,
                            choice1, choice2, choice3, choice4,
                            choice5, choice6, choice7, choice8,
                            choice9, choice10, choice11, choice12,
                            agreement, time_input_type
                        ) VALUES (
                            %(title_masked)s, %(content_enc)s, %(post_pwd_hash)s,
                            %(author_name)s, %(author_nickname)s, %(author_contact)s,
                            %(author_phone)s, %(author_mobile)s, %(author_email)s, %(author_gender)s,
                            %(birth_year)s, %(birth_datetime)s, %(birth_hour)s, %(birth_minute)s,
                            %(calendar_type)s, %(yundal)s, %(hour_ji)s,
                            %(snsgu)s, %(smember_id)s, %(admin_id)s, %(ti_role)s,
                            %(choice1)s, %(choice2)s, %(choice3)s, %(choice4)s,
                            %(choice5)s, %(choice6)s, %(choice7)s, %(choice8)s,
                            %(choice9)s, %(choice10)s, %(choice11)s, %(choice12)s,
                            %(agreement)s, %(time_input_type)s
                        ) RETURNING ticket_id
                    """, ticket_data)
                    
                    ticket_id = cursor.fetchone()[0]
                    print(f"✅ INSERT 성공 - ticket_id: {ticket_id}")
                    conn.commit()
                    print(f"✅ COMMIT 완료")
                    return str(ticket_id)  # UUID를 문자열로 반환
                    
        except psycopg2.Error as db_error:
            print(f"❌ 데이터베이스 오류: {db_error}")
            print(f"   오류 코드: {db_error.pgcode}")
            print(f"   오류 메시지: {db_error.pgerror}")
            import traceback
            traceback.print_exc()
            raise
        except Exception as e:
            print(f"❌ _create_ticket_internal 오류: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def get_tickets(self, limit=50, offset=0, snsgu=None, smember_id=None):
        """티켓 목록 조회"""
        try:
            # 성능 최적화: 필수 로그만 출력
            if snsgu or smember_id:
                print(f"🔍 get_tickets - snsgu: {snsgu}, smember_id: {smember_id}")
            
            if not self._ensure_tables_exist():
                return []
            
            with self._get_connection() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    
                    # 필터 조건 추가
                    where_clause = "WHERE status != 'DELETED'"
                    params = []
                    
                    if snsgu:
                        where_clause += " AND snsgu = %s"
                        params.append(snsgu)
                    
                    if smember_id:
                        where_clause += " AND smember_id = %s"
                        params.append(smember_id)
                    
                    params.extend([limit, offset])
                    
                    query = f"""
                        SELECT *
                        FROM tickets
                        {where_clause}
                        ORDER BY created_at DESC
                        LIMIT %s OFFSET %s
                    """
                    
                    cursor.execute(query, tuple(params))
                    rows = cursor.fetchall()
                    
                    # 성능 최적화: 조회 결과만 간단히 로그
                    if len(rows) > 0:
                        print(f"✅ {len(rows)}건 조회 완료")
                    
                    tickets = []
                    for row in rows:
                        try:
                            ticket = dict(row)
                            # 하위 호환성을 위해 필요한 별칭 추가
                            ticket['id'] = str(ticket.get('ticket_id', ''))
                            ticket['title'] = ticket.get('title_masked', '')
                            ticket['content'] = ticket.get('content_enc', '')
                            ticket['password_hash'] = ticket.get('post_pwd_hash', '')
                            ticket['view_count'] = 0
                            tickets.append(ticket)
                        except Exception as row_error:
                            print(f"❌ 행 변환 오류: {row_error}")
                            continue
                    
                    return tickets
                    
        except psycopg2.Error as db_error:
            print(f"❌ 데이터베이스 오류: {db_error}")
            import traceback
            traceback.print_exc()
            raise
        except Exception as e:
            print(f"❌ get_tickets 오류: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def get_ticket_by_id(self, ticket_id):
        """ID로 티켓 조회"""
        if not self._ensure_tables_exist():
            return None
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                # UUID 또는 문자열 처리
                if isinstance(ticket_id, str):
                    try:
                        uuid.UUID(ticket_id)  # UUID 형식 검증
                    except ValueError:
                        return None
                
                cursor.execute("""
                    SELECT *
                    FROM tickets
                    WHERE ticket_id = %s AND status != 'DELETED'
                """, (ticket_id,))
                
                row = cursor.fetchone()
                if row:
                    ticket = dict(row)
                    # 하위 호환성을 위해 필요한 별칭 추가
                    ticket['id'] = str(ticket.get('ticket_id', ''))
                    ticket['title'] = ticket.get('title_masked', '')
                    ticket['content'] = ticket.get('content_enc', '')
                    ticket['password_hash'] = ticket.get('post_pwd_hash', '')
                    ticket['view_count'] = 0
                    return ticket
                return None
    
    def verify_ticket_password(self, ticket_id, password_hash):
        """티켓 비밀번호 확인"""
        ticket = self.get_ticket_by_id(ticket_id)
        return ticket and ticket['password_hash'] == password_hash
    
    def increment_view_count(self, ticket_id):
        """조회수 증가 (새 스키마에서는 updated_at 갱신)"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = %s
                """, (ticket_id,))
                conn.commit()
    
    def _update_ticket_internal(self, ticket_id, **kwargs):
        """내부용 티켓 수정 메서드 - 모든 필드 지원"""
        print(f"🔄 _update_ticket_internal 시작: ticket_id={ticket_id}")
        print(f"📊 업데이트할 데이터: {kwargs}")
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # 업데이트할 필드와 값 준비
                update_fields = []
                update_values = []
                
                # 기본 필드
                if 'title' in kwargs or 'title_masked' in kwargs:
                    update_fields.append("title_masked = %s")
                    update_values.append(kwargs.get('title_masked') or kwargs.get('title', ''))
                
                if 'content' in kwargs or 'content_enc' in kwargs:
                    update_fields.append("content_enc = %s")
                    update_values.append(kwargs.get('content_enc') or kwargs.get('content', ''))
                
                # 작성자 정보
                if 'author_name' in kwargs:
                    update_fields.append("author_name = %s")
                    update_values.append(kwargs.get('author_name', ''))
                
                if 'author_contact' in kwargs:
                    update_fields.append("author_contact = %s")
                    update_values.append(kwargs.get('author_contact', ''))
                
                if 'author_gender' in kwargs:
                    update_fields.append("author_gender = %s")
                    update_values.append(kwargs.get('author_gender', ''))
                
                # 사주 필드들
                if 'birth_year' in kwargs:
                    update_fields.append("birth_year = %s")
                    update_values.append(kwargs.get('birth_year'))
                
                if 'birth_datetime' in kwargs:
                    update_fields.append("birth_datetime = %s")
                    update_values.append(kwargs.get('birth_datetime'))
                
                if 'birth_hour' in kwargs:
                    update_fields.append("birth_hour = %s")
                    update_values.append(kwargs.get('birth_hour'))
                
                if 'birth_minute' in kwargs:
                    update_fields.append("birth_minute = %s")
                    update_values.append(kwargs.get('birth_minute'))
                
                if 'calendar_type' in kwargs:
                    update_fields.append("calendar_type = %s")
                    update_values.append(kwargs.get('calendar_type', ''))
                
                if 'yundal' in kwargs:
                    update_fields.append("yundal = %s")
                    update_values.append(kwargs.get('yundal', 'N'))
                
                if 'hour_ji' in kwargs:
                    update_fields.append("hour_ji = %s")
                    update_values.append(kwargs.get('hour_ji', ''))
                
                # 항상 updated_at 갱신
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                
                if not update_fields:
                    print("⚠️ 업데이트할 필드가 없습니다")
                    return
                
                # ticket_id를 마지막에 추가
                update_values.append(ticket_id)
                
                sql = f"""
                    UPDATE tickets 
                    SET {', '.join(update_fields)}
                    WHERE ticket_id = %s AND status != 'DELETED'
                """
                
                print(f"📝 SQL: {sql}")
                print(f"📊 Values: {update_values}")
                
                cursor.execute(sql, tuple(update_values))
                rows_affected = cursor.rowcount
                print(f"✅ {rows_affected}개 행 업데이트됨")
                
                conn.commit()
                print(f"✅ COMMIT 완료")
    
    def delete_ticket(self, ticket_id):
        """티켓 삭제 (soft delete)"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE tickets 
                    SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP
                    WHERE ticket_id = %s
                """, (ticket_id,))
                conn.commit()
    
    def _create_message_internal(self, ticket_id, content, role='USER', admin_id=None):
        """내부용 메시지 생성 메서드"""
        print(f"🔄 _create_message_internal 호출: ticket_id={ticket_id}, role={role}, admin_id={admin_id}")
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. 메시지 생성 - admin_id 항상 포함 (NULL 허용)
                print(f"📥 DB에 INSERT 할 값 - role: {role}, admin_id: {admin_id}")
                
                cursor.execute("""
                    INSERT INTO thread_messages (ticket_id, content_enc, role, admin_id)
                    VALUES (%s::uuid, %s, %s, %s)
                    RETURNING msg_id
                """, (str(ticket_id), content, role, admin_id))
                
                message_id = cursor.fetchone()[0]
                print(f"📨 메시지 생성 완료: message_id={message_id}, admin_id={admin_id}")
                
                # 2. 관리자 답변인 경우 티켓 상태 강제 업데이트
                if role == 'ADMIN':
                    print(f"🛡️ 관리자 답변 감지 - 상태를 ANSWERED로 업데이트 시작")
                    
                    # 현재 상태 확인
                    cursor.execute("""
                        SELECT status, has_admin_reply FROM tickets WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                    
                    current = cursor.fetchone()
                    if current:
                        print(f"📋 현재 상태: status={current[0]}, has_admin_reply={current[1]}")
                    else:
                        print(f"❌ 티켓을 찾을 수 없음: {ticket_id}")
                        # 모든 티켓 확인
                        cursor.execute("SELECT ticket_id::text FROM tickets LIMIT 3")
                        existing = cursor.fetchall()
                        print(f"🔍 기존 티켓들: {existing}")
                    
                    # 강제로 ANSWERED 상태로 업데이트
                    cursor.execute("""
                        UPDATE tickets 
                        SET has_admin_reply = TRUE,
                            status = 'ANSWERED',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                    
                    rows_affected = cursor.rowcount
                    print(f"📊 업데이트된 행 수: {rows_affected}")
                    
                    if rows_affected == 0:
                        print(f"⚠️ 경고: 업데이트된 행이 없음! ticket_id={ticket_id}")
                        # 다른 형식으로 시도
                        cursor.execute("""
                            UPDATE tickets 
                            SET has_admin_reply = TRUE,
                                status = 'ANSWERED',
                                updated_at = CURRENT_TIMESTAMP
                            WHERE ticket_id::text = %s
                        """, (str(ticket_id),))
                        rows_affected2 = cursor.rowcount
                        print(f"📊 문자열 매칭으로 업데이트된 행 수: {rows_affected2}")
                    
                    # 업데이트 후 확인
                    cursor.execute("""
                        SELECT status, has_admin_reply FROM tickets WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                    
                    after = cursor.fetchone()
                    if after:
                        print(f"✅ 업데이트 후: status={after[0]}, has_admin_reply={after[1]}")
                    else:
                        print(f"❌ 업데이트 후에도 티켓을 찾을 수 없음")
                else:
                    # 일반 사용자 메시지인 경우 updated_at만 업데이트
                    cursor.execute("""
                        UPDATE tickets 
                        SET updated_at = CURRENT_TIMESTAMP
                        WHERE ticket_id = %s::uuid
                    """, (str(ticket_id),))
                
                conn.commit()
                print(f"✅ 트랜잭션 커밋 완료")
                return str(message_id)
    
    def get_messages_by_ticket(self, ticket_id):
        """티켓의 메시지 목록 조회"""
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT 
                        msg_id::text as msg_id,
                        content_enc as content,
                        role,
                        admin_id,
                        created_at
                    FROM thread_messages
                    WHERE ticket_id = %s
                    ORDER BY created_at ASC
                """, (ticket_id,))
                
                return [dict(row) for row in cursor.fetchall()]
    
    # ===========================================
    # 관리자 관련 메서드
    # ===========================================
    
    def create_admin_user(self, username, password_hash, admin_id=None):
        """관리자 사용자 생성"""
        if not self._ensure_tables_exist():
            raise Exception("테이블이 존재하지 않습니다")
        
        if not admin_id:
            admin_id = f"admin_{username}"
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                try:
                    cursor.execute("""
                        INSERT INTO admin_users (admin_id, username, pwd_hash)
                        VALUES (%s, %s, %s)
                        RETURNING admin_id
                    """, (admin_id, username, password_hash))
                    
                    result_id = cursor.fetchone()[0]
                    conn.commit()
                    return result_id
                except psycopg2.IntegrityError:
                    # 이미 존재하는 사용자명
                    conn.rollback()
                    return None
    
    def get_admin_user(self, username):
        """관리자 사용자 조회"""
        if not self._ensure_tables_exist():
            return None
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT admin_id, username, pwd_hash, role, admin_status, created_at
                    FROM admin_users
                    WHERE username = %s
                """, (username,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
    
    def get_admin_user_by_id(self, admin_id):
        """admin_id로 관리자 사용자 조회"""
        if not self._ensure_tables_exist():
            return None
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT admin_id, username, pwd_hash, role, admin_status, created_at
                    FROM admin_users
                    WHERE admin_id = %s
                """, (admin_id,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
    
    def update_admin_user(self, admin_id, username=None, password_hash=None, role=None, admin_status=None):
        """관리자 사용자 정보 수정"""
        if not self._ensure_tables_exist():
            raise Exception("테이블이 존재하지 않습니다")
        
        # 업데이트할 필드만 동적으로 구성
        update_fields = []
        params = []
        
        if username is not None:
            update_fields.append("username = %s")
            params.append(username)
        
        if password_hash is not None:
            update_fields.append("pwd_hash = %s")
            params.append(password_hash)
        
        if role is not None:
            update_fields.append("role = %s")
            params.append(role)
        
        if admin_status is not None:
            update_fields.append("admin_status = %s")
            params.append(admin_status)
        
        if not update_fields:
            return False
        
        params.append(admin_id)
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                try:
                    query = f"""
                        UPDATE admin_users
                        SET {', '.join(update_fields)}
                        WHERE admin_id = %s
                    """
                    cursor.execute(query, params)
                    conn.commit()
                    return cursor.rowcount > 0
                except psycopg2.IntegrityError:
                    conn.rollback()
                    return False
    
    def verify_admin_user(self, username, password_hash):
        """관리자 사용자 인증"""
        if not self._ensure_tables_exist():
            return False
        
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT admin_id FROM admin_users
                    WHERE username = %s AND pwd_hash = %s
                """, (username, password_hash))
                
                return cursor.fetchone() is not None
    
    def get_all_tickets_for_admin(self, limit=100, offset=0):
        """관리자용 전체 티켓 조회 (삭제된 것 포함)"""
        if not self._ensure_tables_exist():
            return []
        
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("""
                    SELECT 
                        ticket_id::text as id,
                        title_masked as title,
                        created_at,
                        status,
                        has_admin_reply,
                        snsgu,
                        author_name,
                        author_nickname
                    FROM tickets
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
                
                tickets = []
                for row in cursor.fetchall():
                    ticket = dict(row)
                    # 하위 호환성을 위해 view_count와 is_deleted 추가
                    ticket['view_count'] = 0
                    ticket['is_deleted'] = (ticket['status'] == 'DELETED')
                    tickets.append(ticket)
                
                return tickets

    # ===========================================
    # 감사 로그 메서드 (새 스키마 전용)
    # ===========================================
    
    def create_audit_log(self, actor, action, target_id=None, ip_address=None):
        """감사 로그 생성"""
        with self._get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO audit_logs (actor, action, target_id, ip_address)
                    VALUES (%s, %s, %s, %s)
                    RETURNING log_id
                """, (actor, action, target_id, ip_address))
                
                log_id = cursor.fetchone()[0]
                conn.commit()
                return log_id

    # ===========================================
    # 메시지 수정/삭제 메서드
    # ===========================================
    
    def update_message(self, message_id, content):
        """메시지 수정"""
        try:
            print(f"✏️ PostgreSQL 메시지 수정 시도: {message_id}, content length: {len(content)}")
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    # UUID 형식 시도
                    try:
                        cursor.execute("""
                            UPDATE thread_messages 
                            SET content_enc = %s
                            WHERE msg_id = %s::uuid
                        """, (content, str(message_id)))
                        rows_affected = cursor.rowcount
                    except Exception as uuid_error:
                        print(f"⚠️ UUID 캐스팅 실패, 문자열 매칭 시도: {uuid_error}")
                        # 문자열 매칭으로 재시도
                        cursor.execute("""
                            UPDATE thread_messages 
                            SET content_enc = %s
                            WHERE msg_id::text = %s
                        """, (content, str(message_id)))
                        rows_affected = cursor.rowcount
                    
                    conn.commit()
                    
                    if rows_affected > 0:
                        print(f"✅ PostgreSQL 메시지 수정 성공: {message_id}, {rows_affected}개 행 수정됨")
                    else:
                        print(f"⚠️ 수정할 메시지를 찾을 수 없음: {message_id}")
                        # 존재하는 메시지 확인
                        cursor.execute("SELECT msg_id::text FROM thread_messages LIMIT 3")
                        existing = cursor.fetchall()
                        print(f"🔍 기존 메시지들 (샘플): {existing}")
                    
        except Exception as e:
            print(f"❌ PostgreSQL 메시지 수정 실패: {e}")
            import traceback
            print(f"❌ 스택 트레이스: {traceback.format_exc()}")
            raise

    def delete_message(self, message_id):
        """메시지 삭제"""
        try:
            print(f"🗑️ PostgreSQL 메시지 삭제 시도: {message_id}")
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    # UUID 형식 시도
                    try:
                        cursor.execute("""
                            DELETE FROM thread_messages 
                            WHERE msg_id = %s::uuid
                        """, (str(message_id),))
                        rows_affected = cursor.rowcount
                    except Exception as uuid_error:
                        print(f"⚠️ UUID 캐스팅 실패, 문자열 매칭 시도: {uuid_error}")
                        # 문자열 매칭으로 재시도
                        cursor.execute("""
                            DELETE FROM thread_messages 
                            WHERE msg_id::text = %s
                        """, (str(message_id),))
                        rows_affected = cursor.rowcount
                    
                    conn.commit()
                    
                    if rows_affected > 0:
                        print(f"✅ PostgreSQL 메시지 삭제 성공: {message_id}, {rows_affected}개 행 삭제됨")
                    else:
                        print(f"⚠️ 삭제할 메시지를 찾을 수 없음: {message_id}")
                    
        except Exception as e:
            print(f"❌ PostgreSQL 메시지 삭제 실패: {e}")
            import traceback
            print(f"❌ 스택 트레이스: {traceback.format_exc()}")
            raise

    # ===========================================
    # sMembers 관리 메서드들
    # ===========================================
    
    def _serialize_member(self, member):
        """회원 데이터를 JSON 직렬화 가능하게 변환"""
        if not member:
            return None
        result = {}
        for key, value in member.items():
            # memoryview, bytes를 문자열로 변환
            if isinstance(value, (memoryview, bytes)):
                result[key] = value.tobytes().hex() if isinstance(value, memoryview) else value.hex()
            else:
                result[key] = value
        return result
    
    def get_smembers(self):
        """모든 회원 정보 조회"""
        try:
            with self._get_connection() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM smembers 
                        ORDER BY created_at DESC
                    """)
                    members = cursor.fetchall()
                    print(f"✅ 회원 {len(members)}명 조회 완료")
                    return [self._serialize_member(dict(m)) for m in members]
        except Exception as e:
            print(f"❌ 회원 목록 조회 실패: {e}")
            import traceback
            print(f"❌ 스택 트레이스: {traceback.format_exc()}")
            raise

    def get_smember_by_id(self, sm_id):
        """특정 회원 정보 조회 (sM_id 기준)"""
        try:
            with self._get_connection() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM smembers WHERE sm_id = %s
                    """, (sm_id,))
                    member = cursor.fetchone()
                    if member:
                        print(f"✅ 회원 조회 완료: {sm_id}")
                        return self._serialize_member(dict(member))
                    else:
                        print(f"⚠️ 회원을 찾을 수 없음: {sm_id}")
                        return None
        except Exception as e:
            print(f"❌ 회원 조회 실패: {e}")
            import traceback
            print(f"❌ 스택 트레이스: {traceback.format_exc()}")
            raise

    def create_smember(self, member_data):
        """새 회원 생성"""
        try:
            with self._get_connection() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    # 필수 필드
                    fields = []
                    values = []
                    placeholders = []
                    
                    # 모든 필드 처리 (PostgreSQL 소문자 변환됨)
                    field_mapping = {
                        'sMem_id': 'smem_id',
                        'sMem_pwdHash': 'smem_pwdhash',
                        'sMem_pwd_salt': 'smem_pwd_salt',
                        'sMem_name': 'smem_name',
                        'sMem_nickname': 'smem_nickname',
                        'sMem_birthdt': 'smem_birthdt',
                        'sMem_birth_year': 'smem_birth_year',
                        'sMem_calendar_type': 'smem_calendar_type',
                        'is_leap_month': 'smem_yundal',  # is_leap_month를 smem_yundal로 매핑
                        'sMem_gender': 'smem_gender',
                        'sMem_buss_name': 'smem_buss_name',
                        'sMem_comp_name': 'smem_comp_name',
                        'sMem_phone': 'smem_phone',
                        'sMem_mobile': 'smem_mobile',
                        'sMem_email': 'smem_email',
                        'zipcode': 'zipcode',
                        'address1': 'address1',
                        'address2': 'address2',
                        'zipcode_s': 'zipcode_s',
                        'address1_s': 'address1_s',
                        'address2_s': 'address2_s',
                        'sMem_snsgu': 'smem_snsgu',
                        'sMem_choice1': 'smem_choice1',
                        'sMem_choice2': 'smem_choice2',
                        'sMem_choice3': 'smem_choice3',
                        'sMem_choice4': 'smem_choice4',
                        'sMem_choice5': 'smem_choice5',
                        'sMem_choice6': 'smem_choice6',
                        'sMem_choice7': 'smem_choice7',
                        'sMem_choice8': 'smem_choice8',
                        'sMem_choice9': 'smem_choice9',
                        'sMem_choice10': 'smem_choice10',
                        'sMem_choice11': 'smem_choice11',
                        'sMem_choice12': 'smem_choice12',
                        'sMem_quest': 'smem_quest',
                        'sMem_content_enc': 'smem_content_enc',
                        'old_name': 'old_name',
                        'new_name': 'new_name',
                        'sMemfam_id': 'smemfam_id',
                        'recommender': 'recommender',
                        'applicant': 'applicant',
                        'signature_file': 'signature_file',
                        'reference': 'reference',
                        'sMem_agreement': 'smem_agreement',
                        'sMem_agree': 'smem_agree',
                        'sMem_admin_id': 'smem_admin_id',
                        'sMem_grade': 'smem_grade',
                        'sMem_status': 'smem_status',
                        'family_gu': 'family_gu',
                        'adviser_role': 'adviser_role'
                    }
                    
                    # DB에 존재하지 않을 수 있는 필드 목록 (선택적 처리)
                    optional_fields = set()  # is_leap_month는 smem_yundal로 매핑되므로 제거
                    
                    for key, db_field in field_mapping.items():
                        if key in member_data:
                            # 선택적 필드는 제외 (DB에 컬럼이 없을 수 있음)
                            if key in optional_fields:
                                continue
                            fields.append(db_field)  # 소문자 테이블이므로 따옴표 불필요
                            
                            # is_leap_month는 boolean으로 변환 (smem_yundal)
                            if key == 'is_leap_month':
                                value = member_data[key]
                                if value is None or value == '':
                                    values.append(False)
                                    print(f"🔍 create_smember - is_leap_month: None/빈값 -> False (smem_yundal)")
                                else:
                                    # 이미 boolean이면 그대로 사용
                                    if isinstance(value, bool):
                                        bool_value = value
                                    else:
                                        # 0, '0', False는 False, 그 외는 True
                                        bool_value = bool(value) and value != 0 and str(value).lower() not in ('0', 'false', '')
                                    values.append(bool_value)
                                    print(f"🔍 create_smember - is_leap_month 변환: {value} (타입: {type(value)}) -> {bool_value} (타입: {type(bool_value)}) (smem_yundal)")
                            else:
                                values.append(member_data[key])
                                # signature_file 디버깅
                                if key == 'signature_file':
                                    print(f"📁 create_smember - signature_file 저장: {member_data[key]} (타입: {type(member_data[key])})")
                            placeholders.append('%s')
                    
                    sql = f"""
                        INSERT INTO smembers ({', '.join(fields)})
                        VALUES ({', '.join(placeholders)})
                        RETURNING *
                    """
                    
                    cursor.execute(sql, values)
                    new_member = cursor.fetchone()
                    conn.commit()
                    
                    print(f"✅ 회원 생성 완료: {new_member['sm_id']}")
                    return self._serialize_member(dict(new_member))
                    
        except Exception as e:
            print(f"❌ 회원 생성 실패: {e}")
            import traceback
            print(f"❌ 스택 트레이스: {traceback.format_exc()}")
            raise

    def update_smember(self, sm_id, member_data):
        """회원 정보 수정"""
        try:
            with self._get_connection() as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    # 수정할 필드만 업데이트
                    update_fields = []
                    values = []
                    
                    field_mapping = {
                        'sMem_id': 'smem_id',
                        'sMem_pwdHash': 'smem_pwdhash',
                        'sMem_pwd_salt': 'smem_pwd_salt',
                        'sMem_name': 'smem_name',
                        'sMem_nickname': 'smem_nickname',
                        'sMem_birthdt': 'smem_birthdt',
                        'sMem_birth_year': 'smem_birth_year',
                        'sMem_calendar_type': 'smem_calendar_type',
                        'is_leap_month': 'smem_yundal',  # is_leap_month를 smem_yundal로 매핑
                        'sMem_gender': 'smem_gender',
                        'sMem_buss_name': 'smem_buss_name',
                        'sMem_comp_name': 'smem_comp_name',
                        'sMem_phone': 'smem_phone',
                        'sMem_mobile': 'smem_mobile',
                        'sMem_email': 'smem_email',
                        'zipcode': 'zipcode',
                        'address1': 'address1',
                        'address2': 'address2',
                        'zipcode_s': 'zipcode_s',
                        'address1_s': 'address1_s',
                        'address2_s': 'address2_s',
                        'sMem_snsgu': 'smem_snsgu',
                        'sMem_choice1': 'smem_choice1',
                        'sMem_choice2': 'smem_choice2',
                        'sMem_choice3': 'smem_choice3',
                        'sMem_choice4': 'smem_choice4',
                        'sMem_choice5': 'smem_choice5',
                        'sMem_choice6': 'smem_choice6',
                        'sMem_choice7': 'smem_choice7',
                        'sMem_choice8': 'smem_choice8',
                        'sMem_choice9': 'smem_choice9',
                        'sMem_choice10': 'smem_choice10',
                        'sMem_choice11': 'smem_choice11',
                        'sMem_choice12': 'smem_choice12',
                        'sMem_quest': 'smem_quest',
                        'sMem_content_enc': 'smem_content_enc',
                        'old_name': 'old_name',
                        'new_name': 'new_name',
                        'sMemfam_id': 'smemfam_id',
                        'recommender': 'recommender',
                        'applicant': 'applicant',
                        'signature_file': 'signature_file',
                        'reference': 'reference',
                        'sMem_agreement': 'smem_agreement',
                        'sMem_agree': 'smem_agree',
                        'sMem_admin_id': 'smem_admin_id',
                        'sMem_grade': 'smem_grade',
                        'sMem_status': 'smem_status',
                        'family_gu': 'family_gu',
                        'adviser_role': 'adviser_role'
                    }
                    
                    # DB에 존재하지 않을 수 있는 필드 목록 (선택적 처리)
                    optional_fields = set()  # is_leap_month는 smem_yundal로 매핑되므로 제거
                    
                    for key, db_field in field_mapping.items():
                        if key in member_data:
                            # 선택적 필드는 제외 (DB에 컬럼이 없을 수 있음)
                            if key in optional_fields:
                                continue
                            update_fields.append(f"{db_field} = %s")  # 소문자 테이블이므로 따옴표 불필요
                            
                            # is_leap_month는 boolean으로 변환 (smem_yundal)
                            if key == 'is_leap_month':
                                value = member_data[key]
                                if value is None or value == '':
                                    values.append(False)
                                    print(f"🔍 update_smember - is_leap_month: None/빈값 -> False (smem_yundal)")
                                else:
                                    # 이미 boolean이면 그대로 사용
                                    if isinstance(value, bool):
                                        bool_value = value
                                    else:
                                        # 0, '0', False는 False, 그 외는 True
                                        bool_value = bool(value) and value != 0 and str(value).lower() not in ('0', 'false', '')
                                    values.append(bool_value)
                                    print(f"🔍 update_smember - is_leap_month 변환: {value} (타입: {type(value)}) -> {bool_value} (타입: {type(bool_value)}) (smem_yundal)")
                            else:
                                values.append(member_data[key])
                                # signature_file 디버깅
                                if key == 'signature_file':
                                    print(f"📁 update_smember - signature_file 저장: {member_data[key]} (타입: {type(member_data[key])})")
                    
                    # updated_at 추가
                    update_fields.append("updated_at = CURRENT_TIMESTAMP")
                    
                    # WHERE 조건용 sm_id 추가
                    values.append(sm_id)
                    
                    sql = f"""
                        UPDATE smembers 
                        SET {', '.join(update_fields)}
                        WHERE sm_id = %s
                        RETURNING *
                    """
                    
                    cursor.execute(sql, values)
                    updated_member = cursor.fetchone()
                    conn.commit()
                    
                    if updated_member:
                        print(f"✅ 회원 수정 완료: {sm_id}")
                        return self._serialize_member(dict(updated_member))
                    else:
                        print(f"⚠️ 수정할 회원을 찾을 수 없음: {sm_id}")
                        return None
                        
        except Exception as e:
            print(f"❌ 회원 수정 실패: {e}")
            import traceback
            print(f"❌ 스택 트레이스: {traceback.format_exc()}")
            raise

    def delete_smember(self, sm_id):
        """회원 삭제"""
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        DELETE FROM smembers WHERE sm_id = %s
                    """, (sm_id,))
                    rows_affected = cursor.rowcount
                    conn.commit()
                    
                    if rows_affected > 0:
                        print(f"✅ 회원 삭제 완료: {sm_id}")
                        return True
                    else:
                        print(f"⚠️ 삭제할 회원을 찾을 수 없음: {sm_id}")
                        return False
                        
        except Exception as e:
            print(f"❌ 회원 삭제 실패: {e}")
            import traceback
            print(f"❌ 스택 트레이스: {traceback.format_exc()}")
            raise