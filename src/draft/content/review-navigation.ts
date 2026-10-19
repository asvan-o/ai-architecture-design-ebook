export const reviewNavigation=[
 {id:'home',label:'홈',path:''},
 {id:'overview',label:'과정 안내',path:'course-overview/'},
 ...['01','02','03','04','05','06','07','08','09','10','11','12','13'].map(id=>({id,label:'제'+Number(id)+'차시',path:'lessons/'+id+'/'})),
] as const;
