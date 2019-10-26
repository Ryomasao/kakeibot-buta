// 全角文字を半角文字にする
export const toASCII = (text: string): string => {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  })
}
