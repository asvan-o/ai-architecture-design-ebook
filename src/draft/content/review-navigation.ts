export const reviewNavigation=[
 {id:'home',label:'홈',path:''},
 {id:'overview',label:'과정 안내',path:'course-overview/'},
 {id:'01',label:'제1차시',path:'lessons/01/'},
 {id:'02',label:'제2차시',path:'lessons/02/'},
 {id:'02-2',label:'제2-2차시 (입문)',path:'lessons/02-2/'},
 ...['03','04','05','06','07'].map(id=>({id,label:'제'+Number(id)+'차시',path:'lessons/'+id+'/'})),
 {id:'07-2',label:'제7-2차시 (리뉴얼·MCP)',path:'lessons/07-2/'},
 {id:'07-3',label:'제7-3차시 (캐드·스케치업 MCP)',path:'lessons/07-3/'},
 ...['08','09','10','11','12','13'].map(id=>({id,label:'제'+Number(id)+'차시',path:'lessons/'+id+'/'})),
] as const;
