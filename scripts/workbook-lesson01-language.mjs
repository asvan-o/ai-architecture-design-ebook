import {ebookText} from './daejeon-ebook-language.mjs';
/** @param {string} text @returns {string} */
export function workbookLesson01Text(text) {
  return ebookText(text)
    .replace(/DJ-CF-01 고객공간 Z1/g, '카페의 고객공간(Z1)')
    .replace(/DJ-CF-01/g, '카페 공간 리뉴얼')
    .replace(/DJ-CF-02/g, '건물 외관 리뉴얼')
    .replace(/Design Brief|Brief/g, '작업 기준서')
    .replace(/RFP/g, '의뢰서')
    .replace(/Reference/g, '참고 이미지')
    .replace(/\bInterior\b|\bINTERIOR\b/g, '실내 공간')
    .replace(/\bExterior\b|\bEXTERIOR\b/g, '건물 외관')
    .replace(/Workflow/g, '작업 흐름')
    .replace(/현황 IMAGE\s*/g, '현황 이미지 ')
    .replace(/IMAGE\s*/g, '현황 이미지 ')
    .replace(/프로젝트/g, '실습')
    .replace(/(?<!\()W1~W5/g, '기존 창호(W1~W5)')
    .replace(/\b(SZ1|D1|W[1-5]|Z1|S1|K1|C1)\b/g, (code, _capture, offset, source) => {
      // Preserve codes already inside an explanatory parenthesis.
      const prefix = source.slice(0, offset);
      if (prefix.lastIndexOf('(') > prefix.lastIndexOf(')')) return code;
      const names = { D1: '기존 주 출입구', W1: '기존 창호', W2: '기존 창호', W3: '기존 창호', W4: '기존 창호', W5: '기존 창호', Z1: '고객공간', S1: '서비스영역', K1: '기존 카운터', SZ1: '기존 간판 영역', C1: '기존 기둥' };
      return `${names[code]}(${code})`;
    });
}
