from flask import Flask, send_from_directory, request, jsonify, render_template
import traceback
import sys

try:
    from mainpillar import calc_saju, convert_lunar_to_solar
except ImportError as e:
    print(f"Import error: {e}", file=sys.stderr)
    traceback.print_exc()
    raise

app = Flask(__name__, static_folder='web/toj/static', template_folder='web/toj/templates')

@app.errorhandler(500)
def internal_error(error):
    import traceback
    error_msg = traceback.format_exc()
    print(f"Internal Server Error: {error_msg}", file=sys.stderr)
    return f"<h1>500 Internal Server Error</h1><pre>{error_msg}</pre>", 500

@app.route('/')
def index():
    try:
        return render_template('toj_exec.html')
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"Template rendering error: {error_msg}", file=sys.stderr)
        return f"<h1>Template Error</h1><pre>{error_msg}</pre>", 500

@app.route('/calc_saju')
def api_calc_saju():
    import os
    birth_str = request.args.get('birth_str')
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'api', 'solar_terms.json')
        result = calc_saju(birth_str, json_path=json_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/convert_lunar_to_solar')
def api_convert_lunar_to_solar():
    try:
        year = request.args.get('year')
        month = request.args.get('month')
        day = request.args.get('day')
        is_leap_param = request.args.get('is_leap', 'false').lower()
        is_leap = is_leap_param in ['true', '1', 'yes']
        
        # 입력값 검증
        if not year or not month or not day:
            return jsonify({'error': 'year, month, day 파라미터가 필요합니다.'}), 400
        
        try:
            year = int(year)
            month = int(month)
            day = int(day)
        except ValueError:
            return jsonify({'error': 'year, month, day는 정수여야 합니다.'}), 400
        
        # 유효한 날짜 범위 검증
        if year < 1900 or year > 2100:
            return jsonify({'error': '년도는 1900-2100 사이여야 합니다.'}), 400
        if month < 1 or month > 12:
            return jsonify({'error': '월은 1-12 사이여야 합니다.'}), 400
        if day < 1 or day > 31:
            return jsonify({'error': '일은 1-31 사이여야 합니다.'}), 400
        
        result = convert_lunar_to_solar(year, month, day, is_leap)
        if result.get('error'):
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"convert_lunar_to_solar error: {error_msg}", file=sys.stderr)
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500

@app.route('/api/<path:filename>')
def serve_api(filename):
    # api 폴더의 JSON 파일 서빙
    import os
    api_folder = os.path.join(os.path.dirname(__file__), 'api')
    return send_from_directory(api_folder, filename)

@app.route('/<path:filename>')
def serve_static(filename):
    # 모든 정적 파일(HTML, JS, CSS, JSON 등) 서빙
    # static 폴더에서 우선 검색
    try:
        return send_from_directory(app.static_folder, filename)
    except Exception:
        # templates 폴더에서 검색 (html 등)
        try:
            return send_from_directory(app.template_folder, filename)
        except Exception:
            return f"파일을 찾을 수 없습니다: {filename}", 404

#if __name__ == '__main__':
#    app.run(host='0.0.0.0', port=5000, debug=True)
#            host='127.0.0.1'로 바꾸면 오직 로컬만 안내됨
    
if __name__ == '__main__':

    # Flask 서버를 5000번 포트로 실행
    # debug=False 로 설정하여 IndentationError 발생 가능성을 줄입니다.
    #app.run(debug=False, port=5000)
    app.run(host='127.0.0.1', port=5000, debug=True)
    
    
