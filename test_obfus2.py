import os
import shutil
import re
import rcssmin
import rjsmin

def obfuscate_html(content):
    """HTML 파일 난독화: 주석 제거 및 공백 최소화"""
    # HTML 주석 제거
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    # 줄바꿈, 탭, 여러 공백을 하나로
    content = re.sub(r'\s+', ' ', content)
    # 앞뒤 공백 제거
    return content.strip()

def obfuscate_css(content):
    """CSS 파일 난독화"""
    return rcssmin.cssmin(content)

def obfuscate_js(content):
    """JavaScript 파일 난독화"""
    return rjsmin.jsmin(content)

def obfuscate_folder(src_folder, dst_folder):
    """
    원본 폴더의 하위 폴더 구조를 유지하면서 
    모든 html, js, css 파일을 난독화하여 저장 폴더에 저장
    
    Args:
        src_folder: 원본 폴더 경로
        dst_folder: 난독화된 파일을 저장할 폴더 경로
    """
    # 원본 폴더 존재 확인
    if not os.path.exists(src_folder):
        print(f"❌ 오류: 원본 폴더를 찾을 수 없습니다: {src_folder}")
        return
    
    # 저장 폴더 생성
    if not os.path.exists(dst_folder):
        os.makedirs(dst_folder)
        print(f"✅ 저장 폴더 생성: {dst_folder}")
    
    # 처리할 파일 확장자
    target_extensions = {'.html', '.js', '.css'}
    
    processed_count = 0
    copied_count = 0
    
    # 원본 폴더의 모든 하위 폴더와 파일을 순회
    for root, dirs, files in os.walk(src_folder):
        # 원본 폴더를 기준으로 한 상대 경로 계산
        rel_path = os.path.relpath(root, src_folder)
        
        # 저장 폴더에 같은 구조로 디렉토리 생성
        if rel_path == '.':
            target_dir = dst_folder
        else:
            target_dir = os.path.join(dst_folder, rel_path)
        
        # 디렉토리가 없으면 생성
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            print(f"📁 폴더 생성: {target_dir}")
        
        # 각 파일 처리
        for file in files:
            src_file = os.path.join(root, file)
            dst_file = os.path.join(target_dir, file)  # 파일명 그대로 유지
            
            # 파일 확장자 확인
            ext = os.path.splitext(file)[1].lower()
            
            try:
                # html, js, css 파일인 경우 난독화 처리
                if ext in target_extensions:
                    # 파일 읽기
                    with open(src_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 확장자에 따라 난독화 함수 선택
                    if ext == '.html':
                        obf_content = obfuscate_html(content)
                    elif ext == '.css':
                        obf_content = obfuscate_css(content)
                    elif ext == '.js':
                        obf_content = obfuscate_js(content)
                    
                    # 난독화된 내용 저장
                    with open(dst_file, 'w', encoding='utf-8') as f:
                        f.write(obf_content)
                    
                    processed_count += 1
                    print(f"✅ 난독화 완료 [{ext.upper()}]: {dst_file}")
                    
                else:
                    # 기타 파일은 그대로 복사 (파일명과 구조 유지)
                    shutil.copy2(src_file, dst_file)
                    copied_count += 1
                    print(f"📋 파일 복사: {dst_file}")
                    
            except Exception as e:
                print(f"❌ 오류 발생 ({src_file}): {str(e)}")
                continue
    
    # 처리 결과 출력
    print("\n" + "="*60)
    print(f"📊 처리 완료:")
    print(f"   - 난독화된 파일: {processed_count}개")
    print(f"   - 복사된 파일: {copied_count}개")
    print(f"   - 총 처리 파일: {processed_count + copied_count}개")
    print("="*60)

# 사용 예시
# pip install rcssmin rjsmin

if __name__ == "__main__":
    print("="*60)
    print("📦 폴더 난독화 도구")
    print("="*60)
    print()
    
    # 원본 폴더 경로 입력
    src = input("원본 폴더 경로를 입력하세요: ").strip()
    if not src:
        print("❌ 원본 폴더 경로가 입력되지 않았습니다.")
        exit(1)
    
    # 저장 폴더 경로 입력
    dst = input("난독화(저장) 폴더 경로를 입력하세요: ").strip()
    if not dst:
        print("❌ 저장 폴더 경로가 입력되지 않았습니다.")
        exit(1)
    
    print()
    print("🚀 난독화 작업을 시작합니다...")
    print()
    
    # 난독화 실행
    obfuscate_folder(src, dst)
    
    print()
    print("✨ 작업이 완료되었습니다!")