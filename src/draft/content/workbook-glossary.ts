// Workbook-only teaching definitions. Canonical Gwangju glossary and raw prompts stay unchanged.
// Source URLs explain the general concepts; related lesson links show this course's teaching use.
export type WorkbookGlossaryCategoryId='ai-prompt'|'visualization'|'automation'|'design-law';
export type WorkbookGlossaryLessonId='overview'|'01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12'|'13';
export interface WorkbookGlossaryTerm {
  id:`term-${string}`;
  category:WorkbookGlossaryCategoryId;
  korean:string;
  english:string;
  acronym?:string;
  aliases?:string[];
  definition:string;
  context:string;
  why:string;
  note?:string;
  lessons:{lessonId:WorkbookGlossaryLessonId;sectionId:string;label:string}[];
  sources:{title:string;url:string}[];
}
export const glossaryCategories:readonly {id:WorkbookGlossaryCategoryId;title:string;description:string}[] = [
  {
    "id": "ai-prompt",
    "title": "AI·프롬프트 기초",
    "description": "입력과 근거, 모델의 해석 범위를 이해합니다."
  },
  {
    "id": "visualization",
    "title": "시각화·렌더링·편집 기법",
    "description": "수정 대상과 표현 방식, 원본 보존의 경계를 구분합니다."
  },
  {
    "id": "automation",
    "title": "자동화·도구·검증",
    "description": "실제 실행과 파일·설정·결과 확인에 쓰는 용어입니다."
  },
  {
    "id": "design-law",
    "title": "법규·수치·설계 분석",
    "description": "공간 계획과 법규 검토의 기본 개념을 읽습니다."
  }
];

export const workbookGlossary:readonly WorkbookGlossaryTerm[] = [
  {
    "id": "term-prompt",
    "category": "ai-prompt",
    "korean": "프롬프트·요청문",
    "english": "Prompt",
    "definition": "AI에게 할 일·입력 자료·조건·원하는 결과를 전달하는 입력입니다.",
    "context": "의뢰 조건을 이미지 편집 요청이나 파일정리 프로그램 제작 요청으로 바꿉니다.",
    "why": "문장이 길기보다 유지·변경·금지와 출력이 명확해야 작업을 비교할 수 있습니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "prompt-basics",
        "label": "제1차시 §07 · AI 작업 요청문(Prompt)"
      },
      {
        "lessonId": "02",
        "sectionId": "l02-first-request",
        "label": "제2차시 §08 · Step 1 · 기본 폴더 구조와 감시 뼈대 만들기"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Prompt engineering",
        "url": "https://developers.openai.com/api/docs/guides/prompt-engineering"
      }
    ]
  },
  {
    "id": "term-hallucination",
    "category": "ai-prompt",
    "korean": "할루시네이션·환각 현상",
    "english": "Hallucination",
    "definition": "AI가 사실이나 근거와 다른 내용을 그럴듯하게 만들어 내는 현상입니다.",
    "context": "없는 도면 치수·방 이름·법규 조항이 답변에 섞였는지 원자료와 대조합니다.",
    "why": "자신 있는 말투나 출처처럼 보이는 표현을 사실 확인으로 대신하지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "grounding",
        "label": "제1차시 §04 · AI는 왜 틀릴 수 있을까?"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-clean-line-criteria",
        "label": "제8차시 §03 · 실습 2 · 최종 확정 도면 기준표 작성과 클린 선화(Clean Line) 준비"
      },
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-07",
        "label": "제10차시 §07 · 반드시 잡아야 할 오류와 과도한 해석"
      }
    ],
    "sources": [
      {
        "title": "NIST · Generative AI Profile, Confabulation",
        "url": "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence"
      }
    ]
  },
  {
    "id": "term-token",
    "category": "ai-prompt",
    "korean": "토큰",
    "english": "Token",
    "definition": "모델이 입력과 출력을 처리할 때 나누어 다루는 데이터 단위입니다.",
    "context": "긴 의뢰서·도면 설명과 여러 차례의 수정 대화도 처리 가능한 양에 영향을 줍니다.",
    "why": "긴 문서를 넣었다고 모든 부분이 같은 비중으로 활용되는 것은 아니므로 필요한 근거를 좁혀 제공합니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "prompt-basics",
        "label": "제1차시 §07 · AI 작업 요청문(Prompt)"
      },
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-06",
        "label": "제10차시 §06 · 노트북 A · 프로젝트 조건 기준서 만들기"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Prompt engineering",
        "url": "https://developers.openai.com/api/docs/guides/prompt-engineering"
      }
    ],
    "note": "한 토큰이 항상 한 글자나 한 단어인 것은 아닙니다. 언어·모델·입력 형식에 따라 다릅니다."
  },
  {
    "id": "term-context-window",
    "category": "ai-prompt",
    "korean": "컨텍스트 윈도우",
    "english": "Context Window",
    "definition": "한 번의 생성에서 모델이 함께 고려할 수 있는 정보량의 한도입니다.",
    "context": "원도면·조건 기준서·이전 대화·출력 요구를 넣을 때 핵심 조건을 다시 명시합니다.",
    "why": "긴 대화에서 앞선 조건이 자동으로 영구 보존된다고 오해하지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "formula",
        "label": "제1차시 §09 · Prompt 작성 7단 공식"
      },
      {
        "lessonId": "10",
        "sectionId": "l10-gw11-08",
        "label": "제10차시 §15 · 노트북 B에 조건 기준서와 공식 법규 넣기"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Prompt engineering",
        "url": "https://developers.openai.com/api/docs/guides/prompt-engineering"
      }
    ],
    "note": "한도와 입력·출력의 계산 방식은 모델·서비스에 따라 달라집니다. 특정 토큰 수를 공통 규칙으로 사용하지 않습니다."
  },
  {
    "id": "term-system-prompt",
    "category": "ai-prompt",
    "korean": "시스템 프롬프트",
    "english": "System Prompt",
    "definition": "AI의 역할·행동 범위·공통 규칙을 정하는 상위 지시입니다.",
    "context": "법규 검토 도구에 근거 우선·미확정 표시 같은 역할 원칙을 정할 때 구분합니다.",
    "why": "일반 채팅에 역할 문장을 적는 것과 서비스의 실제 상위 설정을 바꾸는 것은 다릅니다.",
    "lessons": [
      {
        "lessonId": "10",
        "sectionId": "l10-gw11-05",
        "label": "제10차시 §11 · ChatGPT 역할 설정 프롬프트"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Prompt engineering",
        "url": "https://developers.openai.com/api/docs/guides/prompt-engineering"
      }
    ],
    "note": "제품/API에 따라 system·developer·instructions 등 설정 방식과 우선순위가 다릅니다."
  },
  {
    "id": "term-negative-prompt",
    "category": "ai-prompt",
    "korean": "네거티브 프롬프트",
    "english": "Negative Prompt",
    "definition": "생성 결과에서 피하거나 제외할 요소를 지정하는 조건입니다.",
    "context": "문·창 추가 금지, 사람·문자 제외 등 원치 않는 변화를 적습니다.",
    "why": "무엇을 바꿀지뿐 아니라 무엇이 생기면 안 되는지도 분명히 하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "rules",
        "label": "제1차시 §08 · 좋은 Prompt의 7가지 공통 규칙"
      },
      {
        "lessonId": "04",
        "sectionId": "l04-prompt-a",
        "label": "제4차시 §04 · 외장 마감과 포털을 바꾸는 7단 Prompt"
      }
    ],
    "sources": [
      {
        "title": "ComfyUI · KSampler seed·positive·negative",
        "url": "https://docs.comfy.org/built-in-nodes/sampling/ksampler"
      }
    ],
    "note": "별도 negative 입력칸 지원 여부는 도구마다 다릅니다. 금지 문장을 적어도 결과 보존이 보장되지는 않습니다."
  },
  {
    "id": "term-seed",
    "category": "ai-prompt",
    "korean": "시드",
    "english": "Seed",
    "definition": "확률적 생성에서 초기 난수 상태를 정하는 값입니다.",
    "context": "시드 설정을 지원하는 ComfyUI 작업에서 다른 조건과 함께 남겨 비교합니다.",
    "why": "비교 실험의 조건을 구분하는 데 도움이 되지만 같은 숫자만으로 결과가 고정되는 것은 아닙니다.",
    "lessons": [
      {
        "lessonId": "07",
        "sectionId": "l07-comfyui-env",
        "label": "제7차시 §04 · Stability Matrix · ComfyUI 설치와 실행 환경 구축"
      },
      {
        "lessonId": "07",
        "sectionId": "l07-comfyui-upscale",
        "label": "제7차시 §13 · ComfyUI Upscale 경로와 같은 위치 확대 비교"
      }
    ],
    "sources": [
      {
        "title": "ComfyUI · KSampler seed·positive·negative",
        "url": "https://docs.comfy.org/built-in-nodes/sampling/ksampler"
      }
    ],
    "note": "모델·워크플로우·설정·실행 환경이 달라지면 같은 시드도 같은 결과를 보장하지 않습니다. 시드를 노출하지 않는 도구도 있습니다."
  },
  {
    "id": "term-control-words",
    "category": "ai-prompt",
    "korean": "제어 단어",
    "english": "Control Words",
    "definition": "이 교재에서는 유지·변경·금지처럼 작업 범위를 분명하게 나누는 표현을 뜻합니다.",
    "context": "같은 원본에서 A/B 요청문의 공통 유지 조건과 서로 다른 변경 행동을 구분합니다.",
    "why": "모호한 분위기 표현만으로 지시하는 대신 적용 위치와 경계를 명확하게 만듭니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "rules",
        "label": "제1차시 §08 · 좋은 Prompt의 7가지 공통 규칙"
      },
      {
        "lessonId": "01",
        "sectionId": "execution-prompt",
        "label": "제1차시 §29 · A/B 실행문의 핵심 차이 · 5항목"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Prompt engineering",
        "url": "https://developers.openai.com/api/docs/guides/prompt-engineering"
      }
    ],
    "note": "모든 모델에 공통인 특별 명령어나 구조를 강제로 잠그는 코드가 아닙니다.",
    "aliases": [
      "KEEP",
      "CHANGE",
      "금지 조건"
    ]
  },
  {
    "id": "term-vision",
    "category": "ai-prompt",
    "korean": "비전·멀티모달 입력",
    "english": "Vision / Multimodal Input",
    "definition": "멀티모달은 여러 입력 형식을 함께 다루는 것이며, 비전은 그중 이미지 등 시각 자료를 해석하는 기능입니다.",
    "context": "평면도의 선·방 이름을 읽거나 수정 공간의 재질과 배치를 분석합니다.",
    "why": "이미지를 입력할 수 있다는 사실과 치수·문자·공간 관계를 정확히 판독했다는 사실을 구분합니다.",
    "lessons": [
      {
        "lessonId": "03",
        "sectionId": "l03-analysis",
        "label": "제3차시 §07 · 수정된 공간에서 디자인 요소 찾기"
      },
      {
        "lessonId": "05",
        "sectionId": "l05-reading",
        "label": "제5차시 §04 · AI로 평면도 분석하기"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-notebooklm-plan",
        "label": "제8차시 §02 · 실습 1 · NotebookLM 원본 평면도 1차 판독"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Images and vision",
        "url": "https://developers.openai.com/api/docs/guides/images-vision"
      }
    ],
    "note": "작은 글자·회전된 도면·한국어 표기·정밀 위치 관계는 오독할 수 있으므로 원문을 사람이 대조합니다.",
    "aliases": [
      "멀티모달",
      "이미지 판독"
    ]
  },
  {
    "id": "term-grounding",
    "category": "ai-prompt",
    "korean": "그라운딩",
    "english": "Grounding",
    "definition": "AI 답변의 내용을 확인 가능한 원문·도면·자료의 근거에 연결하는 작업입니다.",
    "context": "원도면 기준표와 프로젝트 조건 기준서를 후속 분석의 사실 기준으로 사용합니다.",
    "why": "관찰한 사실·AI 해석·미확정을 나누고 출처로 돌아갈 수 있게 하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "grounding",
        "label": "제1차시 §04 · AI는 왜 틀릴 수 있을까?"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-clean-line-criteria",
        "label": "제8차시 §03 · 실습 2 · 최종 확정 도면 기준표 작성과 클린 선화(Clean Line) 준비"
      },
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-06",
        "label": "제10차시 §06 · 노트북 A · 프로젝트 조건 기준서 만들기"
      }
    ],
    "sources": [
      {
        "title": "Google Cloud · Grounding overview",
        "url": "https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/grounding/overview"
      }
    ],
    "note": "근거 연결은 오류를 줄이는 방법이며 답변의 무오류를 보증하지 않습니다."
  },
  {
    "id": "term-rag",
    "category": "ai-prompt",
    "korean": "검색 증강 생성",
    "english": "Retrieval-Augmented Generation",
    "definition": "관련 자료를 검색해 찾은 근거를 모델의 입력에 더한 뒤 답변을 만드는 방식입니다.",
    "context": "프로젝트 조건과 공식 법규 원문을 모아 필요한 조항을 찾고 검토 근거를 연결하는 흐름을 이해합니다.",
    "why": "모델의 기억만으로 법규를 답하게 하지 않고 확인 가능한 자료로 돌아가기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "10",
        "sectionId": "l10-gw11-08",
        "label": "제10차시 §15 · 노트북 B에 조건 기준서와 공식 법규 넣기"
      },
      {
        "lessonId": "10",
        "sectionId": "l10-gw11-09",
        "label": "제10차시 §17 · 노트북 B · 1차 체크리스트 작성하기"
      }
    ],
    "sources": [
      {
        "title": "Google Cloud · Retrieval and generation",
        "url": "https://docs.cloud.google.com/generative-ai-app-builder/docs/builder-apis"
      }
    ],
    "acronym": "RAG",
    "note": "파일을 첨부했다고 모든 내용이 자동 검색·검증되거나 법적 판단이 완료된다는 뜻은 아닙니다."
  },
  {
    "id": "term-inpainting",
    "category": "visualization",
    "korean": "인페인팅·부분 편집",
    "english": "Inpainting",
    "definition": "이미지의 지정한 부분을 새로 채우거나 수정하는 편집 방식입니다.",
    "context": "실내 벽 마감·외관 포털·평면도 가구 영역처럼 목표 부위만 수정합니다.",
    "why": "전체 재생성보다 수정 범위를 좁히고 원본과 요청 밖 변화를 대조하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "03",
        "sectionId": "l03-scope",
        "label": "제3차시 §03 · 바꿀 부분과 유지할 부분 정하기"
      },
      {
        "lessonId": "04",
        "sectionId": "l04-scope",
        "label": "제4차시 §03 · 클린업 제거와 유지·변경 경계 설정"
      },
      {
        "lessonId": "05",
        "sectionId": "l05-principle",
        "label": "제5차시 §06 · 유지 영역과 부분 수정 영역 나누기"
      }
    ],
    "sources": [
      {
        "title": "ComfyUI · Inpainting",
        "url": "https://docs.comfy.org/tutorials/basic/inpaint"
      }
    ],
    "note": "부분 편집을 요청해도 비대상 영역이 바뀔 수 있으므로 생성 후 직접 대조합니다."
  },
  {
    "id": "term-outpainting",
    "category": "visualization",
    "korean": "아웃페인팅",
    "english": "Outpainting",
    "definition": "기존 이미지의 테두리 밖으로 캔버스를 넓히며 새 내용을 생성하는 방식입니다.",
    "context": "외관의 주변 풍경을 더 보여 주는 작업과 같은 화면 안의 부분 수정이 어떻게 다른지 구분합니다.",
    "why": "구도 확장과 원본 프레이밍 보존을 동시에 요구하는 충돌을 피하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "04",
        "sectionId": "l04-scope",
        "label": "제4차시 §03 · 클린업 제거와 유지·변경 경계 설정"
      },
      {
        "lessonId": "04",
        "sectionId": "l04-refine",
        "label": "제4차시 §11 · 스케치 래피드 콘셉트와 다각도 뷰"
      }
    ],
    "sources": [
      {
        "title": "ComfyUI · Outpainting",
        "url": "https://docs.comfy.org/tutorials/basic/outpaint"
      }
    ],
    "note": "현재 이미지 안의 표면 수정과 다릅니다. 이 과정의 같은 카메라·프레이밍 비교에서는 임의로 확장하지 않습니다."
  },
  {
    "id": "term-reference-lock",
    "category": "visualization",
    "korean": "레퍼런스 락·구조 고정 요청",
    "english": "Reference Lock",
    "definition": "기준 이미지의 구조·개구부·가구·카메라 등을 유지하라고 명시하는 요청 관례입니다.",
    "context": "재질 Reference는 색·무늬·질감만 참고하고 공간 구조는 BASE를 기준으로 삼습니다.",
    "why": "어느 자료가 구조 기준이고 어느 자료가 표현 참고인지 구분하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "03",
        "sectionId": "l03-material",
        "label": "제3차시 §04 · 재질 참고 이미지 선택 및 Prompt 작성"
      },
      {
        "lessonId": "04",
        "sectionId": "l04-base",
        "label": "제4차시 §02 · 기준 건물과 자료의 역할 읽기"
      },
      {
        "lessonId": "06",
        "sectionId": "l06-main-sub",
        "label": "제6차시 §07 · 실습 4 · 메인 뷰에서 실내 아이레벨 서브 뷰로"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Prompt engineering",
        "url": "https://developers.openai.com/api/docs/guides/prompt-engineering"
      },
      {
        "title": "ComfyUI · Inpainting",
        "url": "https://docs.comfy.org/tutorials/basic/inpaint"
      }
    ],
    "note": "이 교재의 Reference Lock은 모든 도구에 내장된 잠금 기능을 뜻하지 않습니다. 같은 이름의 요청을 써도 보존이 보장되지 않습니다."
  },
  {
    "id": "term-soffit",
    "category": "visualization",
    "korean": "소핏·캐노피 하부면",
    "english": "Soffit",
    "definition": "처마·캐노피·돌출 부재를 아래에서 볼 때 드러나는 하부 면입니다.",
    "context": "제4차시에서는 캐노피 전면과 하부를 나누어 마감·라인 조명의 적용 위치를 지정합니다.",
    "why": "전면 띠만 바꿀 것인지 아래쪽 면까지 바꿀 것인지 혼동하지 않게 합니다.",
    "lessons": [
      {
        "lessonId": "04",
        "sectionId": "l04-prompt-b",
        "label": "제4차시 §08 · 교체형 B와 캐노피 국소 보완 A2"
      }
    ],
    "sources": [
      {
        "title": "City of Hollywood · Design Guidelines, Glossary (NPS 보관)",
        "url": "https://irma.nps.gov/DataStore/DownloadFile/583287"
      }
    ]
  },
  {
    "id": "term-louver",
    "category": "visualization",
    "korean": "루버",
    "english": "Louver",
    "definition": "좁고 긴 판이나 날개를 일정한 간격으로 배열한 건축 부재입니다.",
    "context": "외관 간판 띠의 수평 루버나 실내 수직 루버의 방향·간격·입체감을 지정합니다.",
    "why": "루버의 표면 색 변경과 개수·간격·형상 변경을 구분하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "strategies",
        "label": "제1차시 §27 · 서로 다른 전략 2개"
      },
      {
        "lessonId": "04",
        "sectionId": "l04-prompt-b",
        "label": "제4차시 §08 · 교체형 B와 캐노피 국소 보완 A2"
      },
      {
        "lessonId": "12",
        "sectionId": "l12-portfolio-04",
        "label": "제12차시 §04 · 재료·가구·조명을 적용 위치로 요청하기"
      }
    ],
    "sources": [
      {
        "title": "City of Hollywood · Design Guidelines, Glossary (NPS 보관)",
        "url": "https://irma.nps.gov/DataStore/DownloadFile/583287"
      }
    ],
    "note": "장식·차양·환기 등 쓰임이 다르며, 시각자료만으로 실제 차양·환기 성능을 확정하지 않습니다."
  },
  {
    "id": "term-parapet",
    "category": "visualization",
    "korean": "파라펫·난간벽",
    "english": "Parapet",
    "definition": "지붕이나 테라스 가장자리에서 위로 연장된 낮은 벽입니다.",
    "context": "외관 변경 시 지붕선과 파라펫 높이·두겁의 위치를 원본과 대조합니다.",
    "why": "마감만 바꾸는 요청이 건물 높이나 옥상 형상 변경으로 이어지지 않게 합니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "strategies",
        "label": "제1차시 §27 · 서로 다른 전략 2개"
      },
      {
        "lessonId": "04",
        "sectionId": "l04-base",
        "label": "제4차시 §02 · 기준 건물과 자료의 역할 읽기"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-facade-five",
        "label": "제9차시 §06 · Step 3 · 3층 라운지·옥상 가구와 외관 완성"
      }
    ],
    "sources": [
      {
        "title": "Historic England · Architectural glossary",
        "url": "https://historicengland.org.uk/campaigns/visit/walking-tours/spotter-guide-georgian-townhouse/glossary/"
      }
    ]
  },
  {
    "id": "term-mullion",
    "category": "visualization",
    "korean": "멀리언·창호 분할 부재",
    "english": "Mullion",
    "definition": "나란한 창이나 유리 패널 사이를 나누는 주요 프레임 부재입니다.",
    "context": "창호 주변 마감과 유리 면을 편집할 때 창 분할과 프레임 위치를 유지합니다.",
    "why": "창 개수나 개구부 비례가 바뀐 것을 단순한 재료 변화로 놓치지 않게 합니다.",
    "lessons": [
      {
        "lessonId": "04",
        "sectionId": "l04-base",
        "label": "제4차시 §02 · 기준 건물과 자료의 역할 읽기"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-facade-five",
        "label": "제9차시 §06 · Step 3 · 3층 라운지·옥상 가구와 외관 완성"
      }
    ],
    "sources": [
      {
        "title": "City of Hollywood · Design Guidelines, Glossary (NPS 보관)",
        "url": "https://irma.nps.gov/DataStore/DownloadFile/583287"
      }
    ],
    "note": "유리 안의 가는 보조 분할 부재와 주요 멀리언을 구분해 원도면을 확인합니다."
  },
  {
    "id": "term-piloti",
    "category": "visualization",
    "korean": "필로티",
    "english": "Piloti / Pilotis",
    "definition": "건물을 기둥으로 들어 올려 지상층 일부를 개방한 구성, 또는 그 지지 기둥을 말합니다.",
    "context": "외관을 읽을 때 기둥으로 열린 하부와 벽으로 둘러싸인 실내를 구분하는 참고 용어입니다.",
    "why": "이미지에 기둥이 보인다는 이유만으로 1층 전체를 필로티라고 단정하지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "04",
        "sectionId": "l04-base",
        "label": "제4차시 §02 · 기준 건물과 자료의 역할 읽기"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-drawing-package",
        "label": "제9차시 §02 · 실습 도면 6파일 내려받고 읽기"
      }
    ],
    "sources": [
      {
        "title": "UNESCO · Le Corbusier, modern architecture and pilotis",
        "url": "https://whc.unesco.org/document/152362"
      }
    ],
    "note": "이 용어가 관련 예제의 특정 공간이 법규상 필로티라는 판정을 뜻하지는 않습니다."
  },
  {
    "id": "term-massing",
    "category": "visualization",
    "korean": "매스·매싱",
    "english": "Mass / Massing",
    "definition": "건물의 덩어리 형태와 크기·높이·배치 관계를 단순하게 읽거나 구성하는 방식입니다.",
    "context": "외관 마감 교체에서 층수·외곽 형상·지붕선을 그대로 유지하는 기준으로 사용합니다.",
    "why": "재료 변화와 건물 형태 변화를 구분하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "04",
        "sectionId": "l04-base",
        "label": "제4차시 §02 · 기준 건물과 자료의 역할 읽기"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-core-geometry",
        "label": "제9차시 §04 · Step 1 · 1층 공간과 가구 만들기"
      }
    ],
    "sources": [
      {
        "title": "Autodesk · Conceptual design and massing",
        "url": "https://help.autodesk.com/cloudhelp/2026/ENU/Revit-HaveYouTried/files/GUID-E612B831-02D6-4BF4-98BD-D834A5F3E699.htm"
      }
    ],
    "aliases": [
      "매스",
      "매싱"
    ]
  },
  {
    "id": "term-diagram",
    "category": "visualization",
    "korean": "건축 다이어그램",
    "english": "Architectural Diagram",
    "definition": "공간의 기능·관계·동선·설계 의도를 선택해 간단히 보여 주는 그림입니다.",
    "context": "버블 다이어그램과 Graphviz 공간 관계도로 방 사이의 연결을 검토합니다.",
    "why": "모든 정보를 담은 정밀 도면 대신 어떤 관계를 설명하는 그림인지 분명하게 합니다.",
    "lessons": [
      {
        "lessonId": "06",
        "sectionId": "l06-bubble-diagram",
        "label": "제6차시 §10 · 실습 5 · 공간 기능·인접 관계·동선 다이어그램"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-graphviz-diagram",
        "label": "제8차시 §05 · 실습 4 · Graphviz(DOT) 구조화 데이터와 2D 공간 관계 다이어그램 시각화"
      }
    ],
    "sources": [
      {
        "title": "Smithsonian · Programming and Space Planning §2.1.9",
        "url": "https://www.wbdg.org/FFC/SI/special_cond_ae_services_2020.pdf"
      }
    ],
    "note": "관계도 선은 실제 벽 위치·보행 거리·문 폭을 자동으로 증명하지 않습니다."
  },
  {
    "id": "term-isometric",
    "category": "visualization",
    "korean": "아이소메트릭·엑소노메트릭",
    "english": "Isometric / Axonometric",
    "definition": "엑소노메트릭은 평행 투영으로 입체를 보여 주는 방식이며, 아이소메트릭은 세 축이 같은 비율로 축소되는 그 한 종류입니다.",
    "context": "평면도를 위에서 비스듬히 본 공간 이미지로 바꿔 벽·가구·층별 관계를 확인합니다.",
    "why": "모든 사선 3D 이미지를 엄밀한 아이소메트릭이라고 부르거나 이미지에서 치수를 역산하지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "06",
        "sectionId": "l06-isometric-ab",
        "label": "제6차시 §04 · 실습 2 · 사선 아이소메트릭 콘셉트 A/B"
      },
      {
        "lessonId": "12",
        "sectionId": "l12-portfolio-03",
        "label": "제12차시 §03 · 도면 기반 실사형 아이소메트릭과 컬러 조닝"
      }
    ],
    "sources": [
      {
        "title": "Autodesk · Isometric View",
        "url": "https://help.autodesk.com/cloudhelp/2024/ENU/3DSMax-Reference/files/GUID-2AF27778-8ADF-4F16-A8B3-60756B7E04E9.htm"
      }
    ],
    "note": "AI가 만든 사선 콘셉트 이미지는 정확한 등축 투영을 충족하지 않을 수 있습니다.",
    "aliases": [
      "아이소메트릭",
      "엑소노메트릭",
      "액소노메트릭",
      "등축 투영"
    ]
  },
  {
    "id": "term-context-compositing",
    "category": "visualization",
    "korean": "배경·주변 맥락 합성",
    "english": "Context Compositing",
    "definition": "여러 이미지 요소를 원근·크기·빛의 관계에 맞춰 한 장면으로 결합하는 작업입니다.",
    "context": "기존 외관을 유지한 채 식재·보행부·사람을 단계적으로 추가합니다.",
    "why": "추가 요소의 보기 좋은 표현과 건물·주변 맥락의 정합성을 함께 보기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "04",
        "sectionId": "l04-run-b",
        "label": "제4차시 §09 · A/B 비교와 조경·보행부 추가 합성"
      },
      {
        "lessonId": "12",
        "sectionId": "l12-portfolio-06",
        "label": "제12차시 §06 · AI로 에디토리얼 표지·Intro·Overview 시안 생성"
      }
    ],
    "sources": [
      {
        "title": "Adobe · Composite images",
        "url": "https://helpx.adobe.com/photoshop/using/combine-images-auto-blend-layers.html"
      }
    ],
    "note": "합성된 사람·조경은 시각 제안이며 실제 현장에 존재하거나 시공 가능한 상태라는 증거는 아닙니다."
  },
  {
    "id": "term-mask",
    "category": "visualization",
    "korean": "마스크·편집 영역",
    "english": "Mask",
    "definition": "이미지에서 편집할 부분과 남겨 둘 부분을 구분하는 영역 정보입니다.",
    "context": "도면 식탁이나 외관 포털만 지정하고 주변 벽·문·창은 유지 대상으로 둡니다.",
    "why": "수정 의도를 좁혀 전달하고 결과의 비대상 변화를 확인하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "05",
        "sectionId": "l05-mask",
        "label": "제5차시 §07 · 유지할 구조선과 바꿀 가구 영역 지정"
      },
      {
        "lessonId": "07",
        "sectionId": "l07-partial-fix",
        "label": "제7차시 §11 · 실습 3 · ChatGPT · Gemini 인페인팅으로 오류 영역만 부분 보정하기"
      }
    ],
    "sources": [
      {
        "title": "ComfyUI · Inpainting",
        "url": "https://docs.comfy.org/tutorials/basic/inpaint"
      }
    ],
    "note": "도구에 따라 마스크 색·선택·보존 방식이 다르므로 해당 도구의 실제 표시를 확인합니다."
  },
  {
    "id": "term-rendering",
    "category": "visualization",
    "korean": "렌더링",
    "english": "Rendering",
    "definition": "3D 장면의 형상·재질·조명·카메라를 계산해 볼 수 있는 이미지로 만드는 과정입니다.",
    "context": "Blender 모델의 카메라에서 주간·실내·이동 장면의 표현을 확인합니다.",
    "why": "실제 모델을 렌더한 결과와 사진을 AI가 새롭게 해석한 이미지의 근거를 구분합니다.",
    "lessons": [
      {
        "lessonId": "07",
        "sectionId": "l07-render-bridge",
        "label": "제7차시 §07 · 거친 캡처를 현실형 제안 이미지로 연결하기"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-materials",
        "label": "제9차시 §07 · 벽·바닥·가구의 색과 반사·거칠기 맞추기"
      }
    ],
    "sources": [
      {
        "title": "Khronos · glTF 2.0 Materials",
        "url": "https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#materials"
      },
      {
        "title": "Inria 연구진 · 3D Gaussian Splatting 원 논문",
        "url": "https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/"
      }
    ],
    "note": "AI 이미지 생성에서 쓰는 “렌더처럼 표현”이라는 문구가 실제 3D 모델의 존재를 뜻하지는 않습니다."
  },
  {
    "id": "term-gaussian-splatting",
    "category": "visualization",
    "korean": "가우시안 스플래팅",
    "english": "Gaussian Splatting",
    "definition": "색·투명도·크기 등을 가진 3D 가우시안 요소를 화면에 투영해 장면을 표현하는 기법입니다.",
    "context": "거친 3D 결과의 여러 시점을 탐색하고 후속 현실화 작업용 캡처를 고릅니다.",
    "why": "폴리곤 메쉬와 같은 편집 구조나 정확한 치수 모델이라고 오해하지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "07",
        "sectionId": "l07-mesh-vs-gs",
        "label": "제7차시 §02 · Polygon Mesh · Point Cloud · Gaussian Splatting"
      },
      {
        "lessonId": "07",
        "sectionId": "l07-gs-practice",
        "label": "제7차시 §05 · 실습 1 · TripoSplat 템플릿 읽기와 Gaussian 시점 탐색"
      }
    ],
    "sources": [
      {
        "title": "Inria 연구진 · 3D Gaussian Splatting 원 논문",
        "url": "https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/"
      }
    ],
    "note": "이 차시의 단일 이미지 기반 추정 예제와 원 논문의 다중 사진 기반 재구성 조건은 다릅니다. 보이지 않는 면의 정확성을 보증하지 않습니다.",
    "aliases": [
      "Gaussian",
      "3DGS"
    ]
  },
  {
    "id": "term-upscale",
    "category": "visualization",
    "korean": "업스케일·초해상화",
    "english": "Upscaling / Super Resolution",
    "definition": "이미지의 픽셀 수를 늘리는 작업이며, AI 초해상화는 학습된 패턴으로 세부를 추정해 보완합니다.",
    "context": "같은 부분을 확대해 일반 리사이즈와 AI 결과의 선·글자·질감 차이를 비교합니다.",
    "why": "더 선명해 보인다는 이유로 새로 생긴 디테일을 원본 사실로 받아들이지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "07",
        "sectionId": "l07-upscale-principle",
        "label": "제7차시 §12 · 단순 확대와 AI 초해상화의 차이"
      },
      {
        "lessonId": "07",
        "sectionId": "l07-openvino-sr1033",
        "label": "제7차시 §14 · 실습 4 · OpenVINO SR1033 CPU 세 배 확대"
      }
    ],
    "sources": [
      {
        "title": "OpenVINO · Single Image Super Resolution 1033",
        "url": "https://docs.openvino.ai/2023.3/omz_models_model_single_image_super_resolution_1033.html"
      }
    ],
    "note": "원본에 없던 정밀 치수·작은 글자·설계 정보를 복원했다고 단정할 수 없습니다."
  },
  {
    "id": "term-pbr",
    "category": "visualization",
    "korean": "물리 기반 재질·렌더링",
    "english": "Physically Based Rendering",
    "definition": "빛과 표면의 상호작용을 물리적 특성에 가깝게 근사하는 재질·렌더링 방식입니다.",
    "context": "Blender에서 기본 색·금속성·거칠기 등을 나누어 목재·유리·금속의 인상을 조정합니다.",
    "why": "색 하나만 바꾸는 것과 재질의 반사·거칠기를 바꾸는 차이를 이해합니다.",
    "lessons": [
      {
        "lessonId": "09",
        "sectionId": "l09-materials",
        "label": "제9차시 §07 · 벽·바닥·가구의 색과 반사·거칠기 맞추기"
      }
    ],
    "sources": [
      {
        "title": "Khronos · glTF 2.0 Materials",
        "url": "https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#materials"
      }
    ],
    "acronym": "PBR",
    "note": "PBR 설정이나 보기 좋은 결과만으로 실제 제품 성능·색상·시공 적합성을 검증한 것은 아닙니다."
  },
  {
    "id": "term-vibe-coding",
    "category": "automation",
    "korean": "바이브 코딩",
    "english": "Vibe Coding",
    "definition": "이 교재에서는 자연어로 원하는 동작을 설명하고 AI와 구현·실행·수정을 반복하는 제작 방식을 뜻합니다.",
    "context": "파일정리 프로그램을 감시 뼈대부터 분류·보호·화면까지 단계적으로 만듭니다.",
    "why": "코드를 읽지 않고 결과를 믿는 태도와 구분하고 사람이 범위·규칙·실행 결과를 확인하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-vibe-coding",
        "label": "제2차시 §03 · Vibe Coding이란?"
      },
      {
        "lessonId": "02",
        "sectionId": "l02-first-request",
        "label": "제2차시 §08 · Step 1 · 기본 폴더 구조와 감시 뼈대 만들기"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Agents",
        "url": "https://developers.openai.com/api/docs/guides/agents"
      }
    ],
    "note": "정식 표준 공정명이 아니라 널리 쓰이는 실무 표현을 이 과정의 안전한 실습 흐름으로 정의한 것입니다."
  },
  {
    "id": "term-mcp",
    "category": "automation",
    "korean": "모델 컨텍스트 프로토콜",
    "english": "Model Context Protocol",
    "definition": "AI 애플리케이션이 외부 도구·자료와 정해진 방식으로 연결되도록 하는 공개 프로토콜입니다.",
    "context": "Codex 등 클라이언트와 Blender 도구 서버를 연결해 씬을 조회하고 모델링합니다.",
    "why": "채팅으로 방법을 설명한 것과 실제 연결 도구를 호출해 씬을 바꾼 것을 구분합니다.",
    "lessons": [
      {
        "lessonId": "08",
        "sectionId": "l08-mcp-concept-ecosystem",
        "label": "제8차시 §07 · MCP 개념과 Codex·Blender의 역할"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-collection-control",
        "label": "제9차시 §03 · MCP 연결 점검과 층별 폴더(컬렉션) 켜기·끄기"
      }
    ],
    "sources": [
      {
        "title": "Model Context Protocol · Architecture overview",
        "url": "https://modelcontextprotocol.io/docs/learn/architecture"
      }
    ],
    "acronym": "MCP",
    "note": "프로토콜 연결만으로 어떤 파일이든 안전하게 바꿔도 된다는 권한이 생기는 것은 아닙니다."
  },
  {
    "id": "term-agent",
    "category": "automation",
    "korean": "에이전트·서브에이전트",
    "english": "Agent / Subagent",
    "definition": "목표를 위해 도구를 사용하며 여러 단계를 수행하는 AI 실행 단위이며, 서브에이전트는 나눠 맡은 하위 작업 단위입니다.",
    "context": "파일 생성·테스트·Blender 조작 같은 도구 작업을 맡기되 허용 폴더와 결과를 확인합니다.",
    "why": "설명 답변과 실제 도구 실행을 구별하고 작업을 나눠도 검증 책임이 사라지지 않음을 이해합니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-environment",
        "label": "제2차시 §04 · 실습 환경 준비하기"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-mcp-concept-ecosystem",
        "label": "제8차시 §07 · MCP 개념과 Codex·Blender의 역할"
      }
    ],
    "sources": [
      {
        "title": "OpenAI · Agents",
        "url": "https://developers.openai.com/api/docs/guides/agents"
      }
    ],
    "note": "도구·서비스마다 실행 권한과 분업 방식이 다르며 서로 다른 에이전트가 같은 결론을 냈다는 사실만으로 정답이 되지는 않습니다.",
    "aliases": [
      "Agent",
      "Subagent",
      "서브에이전트"
    ]
  },
  {
    "id": "term-sha256",
    "category": "automation",
    "korean": "해시·SHA-256",
    "english": "Cryptographic Hash / SHA-256",
    "definition": "파일 바이트에서 계산하는 고정 길이 비교값이며, SHA-256은 256비트 해시를 만듭니다.",
    "context": "동일 파일 중복을 찾고 배포 파일이 기준본과 바이트 단위로 같은지 비교합니다.",
    "why": "파일명이나 용량이 같아도 내용이 다른 경우를 구분하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-implementation-spec",
        "label": "제2차시 §10 · Step 3 · 원본 보호와 중복·덮어쓰기 방지"
      },
      {
        "lessonId": "13",
        "sectionId": "l13-portfolio-08",
        "label": "제13차시 §08 · 파일·출처·버전·SHA-256 확인"
      }
    ],
    "sources": [
      {
        "title": "NIST · Secure Hash Standard (FIPS 180-4)",
        "url": "https://csrc.nist.gov/pubs/fips/180-4/upd1/final"
      }
    ],
    "acronym": "SHA-256",
    "note": "해시는 암호화나 전자서명이 아닙니다. 신뢰할 기준 해시와 비교해야 하며 값 일치만으로 출처·저작권·내용의 정확성을 인증하지 않습니다.",
    "aliases": [
      "해시",
      "SHA",
      "체크섬"
    ]
  },
  {
    "id": "term-manifest",
    "category": "automation",
    "korean": "매니페스트·파일 목록",
    "english": "Manifest",
    "definition": "배포할 파일의 경로·크기·해시 등 확인 정보를 모아 둔 목록입니다.",
    "context": "실습 ZIP과 최종 포트폴리오 패키지에 필요한 파일이 빠지거나 바뀌지 않았는지 대조합니다.",
    "why": "자료 묶음의 구성과 비교 기준을 명시적으로 남기기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-run",
        "label": "제2차시 §12 · 완성 프로그램 실행·기능 확인"
      },
      {
        "lessonId": "13",
        "sectionId": "l13-portfolio-08",
        "label": "제13차시 §08 · 파일·출처·버전·SHA-256 확인"
      }
    ],
    "sources": [
      {
        "title": "IETF RFC 8493 · 파일 목록과 checksum manifest",
        "url": "https://www.rfc-editor.org/rfc/rfc8493"
      }
    ],
    "note": "여기서 쓰는 JSON 목록은 이 과정의 형식입니다. 다른 서비스의 매니페스트와 항목이 같다는 뜻은 아닙니다."
  },
  {
    "id": "term-csv",
    "category": "automation",
    "korean": "CSV 표 파일",
    "english": "Comma-Separated Values",
    "definition": "행과 열의 값을 구분 문자로 나누어 저장하는 텍스트 표 형식입니다.",
    "context": "분류 기대 결과나 검토 목록을 표 계산 도구와 주고받을 때 사용합니다.",
    "why": "화면의 표와 저장 파일을 대조하고 문자 인코딩·열 구분이 맞는지 확인하기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-rules",
        "label": "제2차시 §07 · 자동화 규칙과 사람 판단 범위 정하기"
      },
      {
        "lessonId": "13",
        "sectionId": "l13-portfolio-04",
        "label": "제13차시 §04 · 채택·수정·보류·제외의 설계 이유 기록"
      }
    ],
    "sources": [
      {
        "title": "IETF RFC 4180 · CSV",
        "url": "https://www.rfc-editor.org/rfc/rfc4180"
      }
    ],
    "acronym": "CSV",
    "note": "프로그램에 따라 구분 문자·인코딩 처리가 다를 수 있으므로 파일을 실제로 열어 확인합니다."
  },
  {
    "id": "term-json",
    "category": "automation",
    "korean": "JSON 구조화 데이터",
    "english": "JavaScript Object Notation",
    "definition": "이름과 값·목록의 구조로 정보를 저장하고 전달하는 텍스트 형식입니다.",
    "context": "파일정리 규칙·ComfyUI 워크플로우·MCP 설정에 쓰이는 값과 계층을 읽습니다.",
    "why": "문서 내용과 설정 문법을 구분하고 쉼표·따옴표·경로 오류를 찾기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-hierarchy",
        "label": "제2차시 §06 · 기능을 폴더와 파일로 나누기 · Hierarchy"
      },
      {
        "lessonId": "07",
        "sectionId": "l07-gs-practice",
        "label": "제7차시 §05 · 실습 1 · TripoSplat 템플릿 읽기와 Gaussian 시점 탐색"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-blender-mcp-setup",
        "label": "제8차시 §08 · 실습 5 · Blender + MCP 설치 및 Codex 연결"
      }
    ],
    "sources": [
      {
        "title": "IETF RFC 8259 · JSON",
        "url": "https://www.rfc-editor.org/rfc/rfc8259"
      }
    ],
    "acronym": "JSON",
    "note": "JSON은 데이터 형식입니다. 그 파일만으로 실행되는 프로그램이나 AI 모델을 뜻하지 않습니다."
  },
  {
    "id": "term-markdown",
    "category": "automation",
    "korean": "마크다운 문서",
    "english": "Markdown",
    "definition": "간단한 문자 규칙으로 제목·목록·링크 등을 표현하는 읽기 쉬운 텍스트 문서 형식입니다.",
    "context": "작업 기준서·README·결과보고서 초안의 .md 파일을 읽고 정리합니다.",
    "why": "편집 가능한 원문과 PDF처럼 배포하는 표시본의 역할을 나눕니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "brief",
        "label": "제1차시 §25 · 작업 기준서 만들기"
      },
      {
        "lessonId": "13",
        "sectionId": "l13-portfolio-05",
        "label": "제13차시 §06 · 프로젝트 결과보고서 예시와 내 초안"
      }
    ],
    "sources": [
      {
        "title": "CommonMark · Markdown 규격",
        "url": "https://spec.commonmark.org/0.31.2/"
      }
    ],
    "aliases": [
      "MD",
      ".md"
    ]
  },
  {
    "id": "term-ocr",
    "category": "automation",
    "korean": "광학 문자 인식",
    "english": "Optical Character Recognition",
    "definition": "이미지에 있는 글자를 기계가 다룰 수 있는 텍스트로 읽어 내는 기술입니다.",
    "context": "스캔 평면도의 실명·치수·기호를 읽되 원도면의 보이는 표기와 대조합니다.",
    "why": "문자를 추출한 결과가 정확한 뜻이나 설계 조건까지 증명하는 것은 아니기 때문입니다.",
    "lessons": [
      {
        "lessonId": "05",
        "sectionId": "l05-inputs",
        "label": "제5차시 §03 · 원본 CAD/PDF와 이미지의 역할·비식별화"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-notebooklm-plan",
        "label": "제8차시 §02 · 실습 1 · NotebookLM 원본 평면도 1차 판독"
      }
    ],
    "sources": [
      {
        "title": "Google Cloud Vision · OCR",
        "url": "https://docs.cloud.google.com/vision/docs/ocr"
      }
    ],
    "acronym": "OCR",
    "note": "글자 인식과 벽·문·창의 공간 관계 해석은 별개 작업이며, 한글·작은 글자·겹친 선은 재확인이 필요합니다."
  },
  {
    "id": "term-architecture",
    "category": "automation",
    "korean": "프로그램의 큰 구조",
    "english": "Software Architecture",
    "definition": "기능의 역할과 서로 연결되는 관계를 정한 프로그램의 큰 구성입니다.",
    "context": "파일 감시·분류·원본보관·사용자 화면을 어떤 순서와 책임으로 연결할지 나눕니다.",
    "why": "한 코드 파일에 모든 일을 몰아넣기보다 고칠 위치와 실패 책임을 찾기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-architecture",
        "label": "제2차시 §05 · 프로그램의 큰 구조 이해하기 · Architecture"
      }
    ],
    "sources": [
      {
        "title": "IEEE · Software Engineering Terminology (NIST 열람본)",
        "url": "https://www.nist.gov/document/ieee-standard-glossary-software-engineering-terminology"
      }
    ],
    "note": "이 항목의 Architecture는 건축 디자인 분야 자체가 아니라 소프트웨어의 역할·연결 구조를 뜻합니다."
  },
  {
    "id": "term-hierarchy",
    "category": "automation",
    "korean": "폴더·파일의 계층",
    "english": "Hierarchy",
    "definition": "상위·하위 관계로 폴더와 파일을 나누어 배치한 구조입니다.",
    "context": "app에는 기능, data에는 처리 상태를 두고 입력·보관·결과 폴더를 나눕니다.",
    "why": "프로그램의 역할이 실제 어디에 들어 있는지 찾고 허용 경로를 구분합니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-hierarchy",
        "label": "제2차시 §06 · 기능을 폴더와 파일로 나누기 · Hierarchy"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-collection-control",
        "label": "제9차시 §03 · MCP 연결 점검과 층별 폴더(컬렉션) 켜기·끄기"
      }
    ],
    "sources": [
      {
        "title": "IBM · Hierarchical file system concepts",
        "url": "https://www.ibm.com/docs/en/zos/2.5.0?topic=files-hierarchical-file-system-concepts"
      }
    ]
  },
  {
    "id": "term-localhost",
    "category": "automation",
    "korean": "로컬호스트",
    "english": "Localhost",
    "definition": "현재 사용 중인 자기 컴퓨터를 가리키는 네트워크 이름입니다.",
    "context": "파일정리 화면의 127.0.0.1:4174와 Blender MCP의 로컬 연결을 구분합니다.",
    "why": "이 주소를 공유해도 다른 사람 컴퓨터에서 내 프로그램이 그대로 열리는 것은 아니기 때문입니다.",
    "lessons": [
      {
        "lessonId": "02",
        "sectionId": "l02-implement",
        "label": "제2차시 §11 · Step 4 · 화면·외부 가져오기와 최종 통합 예시문"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-blender-mcp-setup",
        "label": "제8차시 §08 · 실습 5 · Blender + MCP 설치 및 Codex 연결"
      }
    ],
    "sources": [
      {
        "title": "IETF RFC 6761 §6.3 · localhost",
        "url": "https://www.rfc-editor.org/rfc/rfc6761#section-6.3"
      }
    ],
    "note": "127.0.0.1은 대표적인 IPv4 루프백 주소입니다. 뒤의 포트 번호는 같은 컴퓨터 안에서 서비스를 구분합니다."
  },
  {
    "id": "term-bcr",
    "category": "design-law",
    "korean": "건폐율",
    "english": "Building Coverage Ratio",
    "definition": "대지면적에 대한 건축면적의 비율입니다.",
    "context": "신축 사업의 대지·건축면적을 기존 인접시설 수치와 섞지 않고 기준서에 정리합니다.",
    "why": "면적의 종류와 대상 대지가 다르면 같은 비율처럼 보여도 검토가 달라지기 때문입니다.",
    "lessons": [
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-06",
        "label": "제10차시 §06 · 노트북 A · 프로젝트 조건 기준서 만들기"
      },
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-07",
        "label": "제10차시 §07 · 반드시 잡아야 할 오류와 과도한 해석"
      }
    ],
    "sources": [
      {
        "title": "국가법령정보센터 · 건축법 제55조",
        "url": "https://www.law.go.kr/법령/건축법/제55조"
      }
    ],
    "acronym": "BCR",
    "note": "허용 한도와 면적 산정은 해당 법령·조례·지구단위계획 및 사업 조건을 확인합니다. 이 정의가 특정 수치의 허용 판정은 아닙니다."
  },
  {
    "id": "term-far",
    "category": "design-law",
    "korean": "용적률",
    "english": "Floor Area Ratio",
    "definition": "대지면적에 대한 용적률 산정용 연면적의 비율입니다.",
    "context": "층별 면적표와 대지면적을 분리하고 용적률 산정에서 포함·제외할 면적을 공식 기준으로 확인합니다.",
    "why": "건물 전체 연면적을 아무 검토 없이 나누면 실제 산정과 달라질 수 있기 때문입니다.",
    "lessons": [
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-06",
        "label": "제10차시 §06 · 노트북 A · 프로젝트 조건 기준서 만들기"
      },
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-07",
        "label": "제10차시 §07 · 반드시 잡아야 할 오류와 과도한 해석"
      }
    ],
    "sources": [
      {
        "title": "국가법령정보센터 · 건축법 제56조",
        "url": "https://www.law.go.kr/법령/건축법/제56조"
      }
    ],
    "acronym": "FAR",
    "note": "용적률 산정에서 제외되는 면적과 허용 한도는 법령·조례·계획·사업 조건에 따라 따로 검토합니다."
  },
  {
    "id": "term-daylight-setback",
    "category": "design-law",
    "korean": "일조 확보를 위한 높이 제한",
    "english": "Daylight-related Height Restriction / Daylight Setback Plane",
    "definition": "일조·채광 확보를 위해 인접 대지와의 거리 등 조건에 따라 건물 높이를 제한하는 규정입니다.",
    "context": "그림자의 인상과 별개로 적용 용도지역·방향·건물 유형·원도면 조건을 공식 원문으로 대조합니다.",
    "why": "보기 좋은 채광 이미지가 법규상 일조 적합성을 증명하지는 않기 때문입니다.",
    "lessons": [
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-11",
        "label": "제10차시 §14 · 필요한 공식 법규·조례·별표 보강하기"
      },
      {
        "lessonId": "12",
        "sectionId": "l12-portfolio-11",
        "label": "제12차시 §11 · 주간·석양·실내를 비교하고 왜곡 검수하기"
      }
    ],
    "sources": [
      {
        "title": "국가법령정보센터 · 건축법 제61조",
        "url": "https://www.law.go.kr/법령/건축법/제61조"
      }
    ],
    "note": "흔히 “일조권 사선제한”이라고 부르지만 모든 건물에 같은 사선이나 수치가 적용되는 것은 아닙니다. 시행령·조례·적용 예외를 확인합니다.",
    "aliases": [
      "일조권",
      "일조권 사선제한",
      "일조 사선"
    ]
  },
  {
    "id": "term-setback",
    "category": "design-law",
    "korean": "이격거리·후퇴거리",
    "english": "Separation Distance / Setback",
    "definition": "건물과 경계선·건축선 또는 다른 건물 사이에 확보하는 거리입니다.",
    "context": "외관·배치도 이미지를 보고 임의 치수를 만들지 않고 적용 기준과 실제 측량·도면을 확인합니다.",
    "why": "대지 안의 공지·도로 후퇴·동간 거리 등 서로 다른 기준을 한 거리로 뭉뚱그리지 않게 합니다.",
    "lessons": [
      {
        "lessonId": "10",
        "sectionId": "l10-gw10-11",
        "label": "제10차시 §14 · 필요한 공식 법규·조례·별표 보강하기"
      },
      {
        "lessonId": "13",
        "sectionId": "l13-portfolio-06",
        "label": "제13차시 §05 · 법규·면적·성능의 확인 범위 남기기"
      }
    ],
    "sources": [
      {
        "title": "국가법령정보센터 · 건축법 제58조",
        "url": "https://www.law.go.kr/법령/건축법/제58조"
      }
    ],
    "note": "영문 setback은 보통 경계·기준선에서의 후퇴를 뜻합니다. 요구 거리는 대상 규정·용도·규모·조례에 따라 확인합니다."
  },
  {
    "id": "term-space-program",
    "category": "design-law",
    "korean": "스페이스 프로그램·소요실 조서",
    "english": "Space Program / Schedule of Accommodation",
    "definition": "필요한 공간의 용도·수량·면적·인접 조건 등을 정리한 기획 목록입니다.",
    "context": "원자료에서 필요한 실과 사용 조건을 정리하고 공간 관계도·조닝의 출발점으로 삼습니다.",
    "why": "방 이름을 나열하는 것과 실제 요구 면적·연결 조건을 정하는 것은 다르기 때문입니다.",
    "lessons": [
      {
        "lessonId": "08",
        "sectionId": "l08-spatial-validation",
        "label": "제8차시 §04 · 실습 3 · 공간 기능·인접 관계·주요 동선 분석과 오독 교차검증"
      },
      {
        "lessonId": "11",
        "sectionId": "l11-portfolio-02",
        "label": "제11차시 §02 · 평면·단면·입면으로 생활의 조건 읽기"
      }
    ],
    "sources": [
      {
        "title": "Smithsonian · Programming and Space Planning §2.1.9",
        "url": "https://www.wbdg.org/FFC/SI/special_cond_ae_services_2020.pdf"
      }
    ],
    "note": "여기서 Program은 컴퓨터 실행 프로그램을 뜻하지 않습니다."
  },
  {
    "id": "term-zoning",
    "category": "design-law",
    "korean": "공간 조닝",
    "english": "Spatial Zoning",
    "definition": "공간을 기능·사용자·활동·관계에 따라 영역으로 나누어 계획하거나 설명하는 작업입니다.",
    "context": "공용·개인·지원 영역과 이동 관계를 컬러 개념도에서 비교합니다.",
    "why": "색칠한 영역과 실제 벽·문·실측 경계가 같다고 오해하지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "06",
        "sectionId": "l06-zoning-concept",
        "label": "제6차시 §09 · 3D 콘셉트에서 다시 2D 조닝으로 돌아오는 이유"
      },
      {
        "lessonId": "06",
        "sectionId": "l06-zoning-bridge",
        "label": "제6차시 §11 · 실습 6 · Top View 3D에서 2D 컬러 개념 조닝으로"
      },
      {
        "lessonId": "12",
        "sectionId": "l12-portfolio-03",
        "label": "제12차시 §03 · 도면 기반 실사형 아이소메트릭과 컬러 조닝"
      }
    ],
    "sources": [
      {
        "title": "Smithsonian · Programming and Space Planning §2.1.9",
        "url": "https://www.wbdg.org/FFC/SI/special_cond_ae_services_2020.pdf"
      }
    ],
    "note": "이 과정의 조닝은 공간 구성 개념입니다. 법률상의 용도지역·용도지구 지정과 구분합니다."
  },
  {
    "id": "term-circulation",
    "category": "design-law",
    "korean": "동선",
    "english": "Circulation",
    "definition": "사람이나 물품이 공간 안팎을 이동하는 경로와 연결 관계입니다.",
    "context": "출입구·작업대·회의실·계단 사이를 어떻게 오가는지 도면과 다이어그램에서 대조합니다.",
    "why": "가구 배치가 보기 좋아도 이동을 막거나 관계도 선이 실제 출입구와 어긋날 수 있기 때문입니다.",
    "lessons": [
      {
        "lessonId": "06",
        "sectionId": "l06-bubble-diagram",
        "label": "제6차시 §10 · 실습 5 · 공간 기능·인접 관계·동선 다이어그램"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-spatial-validation",
        "label": "제8차시 §04 · 실습 3 · 공간 기능·인접 관계·주요 동선 분석과 오독 교차검증"
      },
      {
        "lessonId": "09",
        "sectionId": "l09-moving-3",
        "label": "제9차시 §12 · 카메라 3 · 160초 주택 동선 프리뷰와 구간 수정"
      }
    ],
    "sources": [
      {
        "title": "Smithsonian · Programming and Space Planning §2.1.9",
        "url": "https://www.wbdg.org/FFC/SI/special_cond_ae_services_2020.pdf"
      }
    ],
    "note": "개념 동선도만으로 피난폭·접근성·안전 기준 충족을 확정하지 않습니다."
  },
  {
    "id": "term-core",
    "category": "design-law",
    "korean": "건축 코어",
    "english": "Building Core",
    "definition": "계단·승강기·설비 샤프트 등 수직 이동과 지원 기능이 모이는 부분입니다.",
    "context": "평면도에서 계단·승강기·설비 영역을 고정 조건으로 읽고 입체화 결과와 대조합니다.",
    "why": "가구나 마감처럼 쉽게 옮길 수 있는 요소로 잘못 다루지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "05",
        "sectionId": "l05-elements",
        "label": "제5차시 §02 · 평면도의 구성 요소 읽기"
      },
      {
        "lessonId": "08",
        "sectionId": "l08-notebooklm-plan",
        "label": "제8차시 §02 · 실습 1 · NotebookLM 원본 평면도 1차 판독"
      }
    ],
    "sources": [
      {
        "title": "GSA · Core와 수직 이동 공간 예시",
        "url": "https://www.gsa.gov/system/files/NBSAP%20March%202026_FINAL.pdf"
      }
    ],
    "note": "코어의 구성은 건물마다 다르며 모든 화장실·복도·내벽이 구조 코어라는 뜻은 아닙니다."
  },
  {
    "id": "term-rfp",
    "category": "design-law",
    "korean": "의뢰서·제안요청서",
    "english": "Request for Proposal",
    "definition": "발주 목적·요구사항·범위·제출 조건을 제안자에게 전달하는 문서입니다.",
    "context": "가상 의뢰서의 근거와 제약을 읽고 서로 다른 두 전략을 비교합니다.",
    "why": "디자이너의 아이디어와 발주자가 실제 요구한 조건을 구분합니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "rfp-guide",
        "label": "제1차시 §17 · 의뢰서란?"
      },
      {
        "lessonId": "01",
        "sectionId": "read-rfp",
        "label": "제1차시 §19 · 의뢰서와 도면·현황 이미지의 역할"
      }
    ],
    "sources": [
      {
        "title": "미국 조달청 · RFP의 요구사항·제출조건 설명",
        "url": "https://www.acquisition.gov/far/15.203"
      }
    ],
    "acronym": "RFP",
    "note": "참고한 해외 RFP 문서는 일반 개념의 출처입니다. 실제 국내 사업의 형식·계약 효력·절차는 해당 발주 문서를 따릅니다."
  },
  {
    "id": "term-design-brief",
    "category": "design-law",
    "korean": "작업 기준서·디자인 브리프",
    "english": "Design Brief",
    "definition": "확인한 목표·조건·우선순위를 다음 디자인 작업의 기준으로 정리한 문서입니다.",
    "context": "의뢰서 분석과 확인 답변을 바탕으로 유지·변경·미확정과 A/B 전략을 정리합니다.",
    "why": "원문 요약을 넘어 어떤 기준으로 디자인할지 연결하되 새 가정을 사실로 섞지 않기 위해서입니다.",
    "lessons": [
      {
        "lessonId": "01",
        "sectionId": "brief",
        "label": "제1차시 §25 · 작업 기준서 만들기"
      },
      {
        "lessonId": "11",
        "sectionId": "l11-portfolio-03",
        "label": "제11차시 §03 · 건축주 요구를 설계 우선순위로 바꾸기"
      }
    ],
    "sources": [
      {
        "title": "Smithsonian · Programming and Space Planning §2.1.9",
        "url": "https://www.wbdg.org/FFC/SI/special_cond_ae_services_2020.pdf"
      }
    ],
    "note": "이 과정의 작업 문서이며 발주기관의 최종 승인이나 실제 계약 변경 문서를 대신하지 않습니다."
  }
];

// One concise note at each selected major section; no automatic replacement inside prompts.
export const sectionTermNotes:Readonly<Record<string,string[]>> = {
  "overview:roles": [
    "term-grounding",
    "term-hallucination"
  ],
  "overview:tools": [
    "term-vision",
    "term-mcp"
  ],
  "01:grounding": [
    "term-hallucination",
    "term-grounding"
  ],
  "01:prompt-basics": [
    "term-prompt",
    "term-token",
    "term-context-window"
  ],
  "01:rules": [
    "term-control-words",
    "term-negative-prompt"
  ],
  "01:rfp-guide": [
    "term-rfp"
  ],
  "01:brief": [
    "term-design-brief"
  ],
  "02:l02-vibe-coding": [
    "term-vibe-coding",
    "term-agent"
  ],
  "02:l02-architecture": [
    "term-architecture"
  ],
  "02:l02-hierarchy": [
    "term-hierarchy",
    "term-json"
  ],
  "02:l02-implementation-spec": [
    "term-sha256"
  ],
  "02:l02-implement": [
    "term-localhost"
  ],
  "03:l03-scope": [
    "term-inpainting",
    "term-reference-lock"
  ],
  "03:l03-analysis": [
    "term-vision"
  ],
  "04:l04-base": [
    "term-massing",
    "term-parapet",
    "term-mullion"
  ],
  "04:l04-prompt-b": [
    "term-soffit",
    "term-louver"
  ],
  "04:l04-run-b": [
    "term-context-compositing"
  ],
  "04:l04-refine": [
    "term-outpainting"
  ],
  "05:l05-elements": [
    "term-core"
  ],
  "05:l05-inputs": [
    "term-ocr"
  ],
  "05:l05-mask": [
    "term-mask"
  ],
  "06:l06-isometric-ab": [
    "term-isometric"
  ],
  "06:l06-bubble-diagram": [
    "term-diagram",
    "term-circulation"
  ],
  "06:l06-zoning-bridge": [
    "term-zoning"
  ],
  "07:l07-mesh-vs-gs": [
    "term-gaussian-splatting"
  ],
  "07:l07-comfyui-env": [
    "term-seed"
  ],
  "07:l07-render-bridge": [
    "term-rendering"
  ],
  "07:l07-upscale-principle": [
    "term-upscale"
  ],
  "08:l08-clean-line-criteria": [
    "term-grounding",
    "term-ocr"
  ],
  "08:l08-spatial-validation": [
    "term-space-program",
    "term-circulation"
  ],
  "08:l08-mcp-concept-ecosystem": [
    "term-mcp",
    "term-agent"
  ],
  "09:l09-collection-control": [
    "term-hierarchy"
  ],
  "09:l09-materials": [
    "term-pbr"
  ],
  "10:l10-gw10-06": [
    "term-bcr",
    "term-far"
  ],
  "10:l10-gw11-05": [
    "term-system-prompt"
  ],
  "10:l10-gw11-08": [
    "term-rag"
  ],
  "10:l10-gw10-11": [
    "term-daylight-setback",
    "term-setback"
  ],
  "11:l11-portfolio-02": [
    "term-space-program"
  ],
  "11:l11-portfolio-05": [
    "term-diagram"
  ],
  "12:l12-portfolio-03": [
    "term-isometric",
    "term-zoning"
  ],
  "12:l12-portfolio-06": [
    "term-context-compositing"
  ],
  "13:l13-portfolio-04": [
    "term-csv"
  ],
  "13:l13-portfolio-05": [
    "term-markdown"
  ],
  "13:l13-portfolio-08": [
    "term-sha256",
    "term-manifest"
  ]
};
