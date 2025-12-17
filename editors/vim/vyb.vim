" Vim syntax file for Vyb test files
" Language: Vyb
" Maintainer: VybTest
" Latest Revision: 2024

if exists("b:current_syntax")
  finish
endif

" Comments
syn match vybComment "#.*$"

" Test names (quoted strings at start of line followed by colon)
syn match vybTestName /^"[^"]\+":/

" Keywords
syn keyword vybKeyword confidence given when then mocks property runtime component props

" Expect keyword
syn match vybExpect /\<expect:/

" Confidence values
syn match vybConfidence /\<confidence:\s*\(0\.\d\+\|1\.0\)/

" Comparison operators
syn match vybOperator /==\|!=\|>=\|<=\|>\|</
syn keyword vybOperator contains startsWith endsWith matches

" Assignment
syn match vybAssignment /\<\w\+\s*=/

" Function calls
syn match vybFunction /\<\w\+\s*(/me=e-1

" Strings
syn region vybString start=/"/ skip=/\\"/ end=/"/

" Numbers
syn match vybNumber /\<\d\+\(\.\d\+\)\?\>/

" YAML list markers
syn match vybListItem /^\s*-\s/

" Highlighting
hi def link vybComment Comment
hi def link vybTestName Function
hi def link vybKeyword Keyword
hi def link vybExpect Special
hi def link vybConfidence Number
hi def link vybOperator Operator
hi def link vybAssignment Identifier
hi def link vybFunction Function
hi def link vybString String
hi def link vybNumber Number
hi def link vybListItem Delimiter

let b:current_syntax = "vyb"
