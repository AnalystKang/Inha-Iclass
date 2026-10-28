# iclass

인하대 아이클래스(learn.inha.ac.kr) 다운로더 Chrome 확장.

- **📥 원본 다운로드** (자료 페이지, 초록) — 원본 파일 그대로. 권장.
- **📥 PDF 다운로드** (문서 뷰어, 파랑) — 원본이 막혔을 때 fallback. 페이지 이미지를 합쳐 PDF 생성.
- **🎬 m3u8 링크 복사** (강의영상 페이지, 보라) — 영상 스트림 링크 추출.

## 원리

**원본**: `learn.inha.ac.kr/local/ubdoc/` 뷰어는 `dl` 플래그로 다운로드 버튼만 숨길 뿐,
서버의 `adownload.php`는 `dl`과 무관하게 원본 파일을 그대로 내려준다.
자료 페이지의 쿼리(`id/tp/pg/item/fid`)를 `adownload.php`에 붙이면 원본이 받아진다.

**fallback(PDF 합성)**: coursemos Synap 뷰어는 원본 대신 각 페이지를 PNG로 렌더한다
(`doc.coursemos.co.kr/<org>/<id>/<hash>.files/N.png`). `dl=0`이어도 접근 가능하므로,
전부 받아 JPEG로 변환 후 의존성 없는 자체 작성기로 PDF 1개로 합친다(`pdf.js`, jsPDF 미사용).

**m3u8**: 강의영상 페이지 HTML에서 `.m3u8` 링크를 찾아 클립보드로 복사.

## 설치

**방법 1 — 압축해제 로드(권장, 수정 쉬움)**
1. `chrome://extensions` → **개발자 모드** 켜기
2. **압축해제된 확장 프로그램을 로드** → `extension/` 폴더 선택

**방법 2 — crx 설치**
- `inha_iclass.crx`를 `chrome://extensions`(개발자 모드)로 드래그.
  (최신 Chrome은 외부 crx 설치를 막는 경우가 많으니 방법 1 권장)

## 사용

아이클래스에서 자료/영상 열고 우상단 버튼 클릭.
원본이 안 되면 뷰어의 파랑 **PDF 다운로드** 사용.

> 뷰어가 iframe 안이어도 동작. 버튼이 없으면 완전히 로드된 뒤 새로고침.

## 구조

- `extension/manifest.json` — content script 주입 규칙
- `extension/ubdoc.js` — 자료 페이지 원본 다운로드(`adownload.php`)
- `extension/content.js` — coursemos 뷰어, 페이지 PNG → PDF 합성(fallback)
- `extension/pdf.js` — 의존성 없는 image→PDF 작성기 (node/브라우저 공용)
- `extension/vod.js` — 강의영상 m3u8 링크 추출
- `test/pdf.test.js` — PDF 작성기 검증 (`node test/pdf.test.js`)

## 빌드(crx)

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension="$PWD/extension"
mv -f extension.crx inha_iclass.crx
```
서명키 `extension.pem`은 최초 1회 생성되며 git에 올리지 않는다(`.gitignore`).

## 이용 범위 및 저작권 고지

이 도구는 **본인이 정당하게 수강 중인 과목의 자료를, 개인 복습 목적으로 열람·보관**
하는 용도로만 제공된다. 아래를 반드시 지킬 것.

- 강의영상·자료의 저작권은 담당 교수 및 인하대학교(또는 원저작권자)에 있다.
- **재배포·공유·업로드·판매 금지.** 내려받은 파일을 타인에게 전송하거나
  외부(클라우드 공유, 커뮤니티, SNS 등)에 올리는 행위는 저작권법 위반이다.
- 저작권법 제136조에 따라 무단 복제·전송·배포는 5년 이하 징역 또는
  5천만원 이하 벌금 대상이 될 수 있다.
- 오프라인 보관이 꼭 필요하면 **담당 교수·조교 또는 학교의 사전 허가**를 받을 것.

> 이 고지는 책임 면제가 아니라 사실 안내다. 위 범위를 벗어난 사용에 대한 법적 책임은
> 전적으로 사용자 본인에게 있으며, 그런 용도로는 이 도구를 사용하지 말 것.
