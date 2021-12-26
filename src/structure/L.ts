type ReplacerOptions<S extends string, O = {}> = 
    S extends '' 
     ? O 
     : S extends `{${infer C}}${infer Back}` 
      ? ReplacerOptions<Back, O & Record<C, string>> 
      : S extends `${string}${infer B}` 
       ? ReplacerOptions<B, O> 
       : never

export const TABLE = {
    'no-talk-targets': '대화중인 상대가 없습니다.',
    'sending': '전송 중..',
    'send-failed': '{count}명에게 전송 실패',
    'leaving-talk': '대화에서 나가는 중입니다...',
    'leave-talk-success': '대화에서 나갔습니다.',
    'leaved': '{target}님이 나갔습니다.',
    'matching': '대화 상대를 찾고 있습니다...',
    'matching-canceled': '취소 완료',
    'talk-started': '{targets} 님과의 대화가 시작되었습니다.',
    'list-is-empty': '목록이 비어있습니다.',
    'render-chat': '{id}: {content}',
    'render-chat-me': '{id}(나): {content}',
    'already-matching': '이미 대화 상대를 찾는 중입니다.'
} as const

export const L = <K extends keyof typeof TABLE>(key: K, replacer?: ReplacerOptions<typeof TABLE[K]>) => {
    let result: string = TABLE[key]
    for (const k in replacer) {
        result = result.replace(`{${k}}`, String(replacer[k]))
    }
    return result
}
