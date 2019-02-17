"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => Text, tab and indent related
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
set autoindent
set smartindent
set smarttab
set expandtab
" 1 tab == 2 spaces
set shiftwidth=2
set softtabstop=2
set tabstop=2

" render whitespaces
:set listchars=eol:↵,tab:›\ ,space:‧
:set list

let NERDTreeShowHidden = 1
let NERDTreeIgnore = ['\.swp', '\.swo']

let g:ale_fixers = { 'javascript': ['prettier', 'eslint'] }
let g:ale_linters = { 'javascript': ['eslint'] }
let g:ale_javascript_eslint_executable = 'eslint'
let g:ale_javascript_eslint_options = ''
let g:ale_fix_on_save = 1
let g:ale_sign_error = 'x!'
