const PptxGenJS = require('./node_modules/pptxgenjs/dist/pptxgen.cjs.js');
const pptx = new PptxGenJS();
const OUT = 'C:/Users/kouki/OneDrive/ドキュメント/オゾシフ/会議資料.pptx';
pptx.layout = 'LAYOUT_WIDE';

const C_LINE='06C755',C_DARK='1A1A2E',C_BG='F4F6F9',C_WHITE='FFFFFF',C_TEXT='212121',
      C_SUB='546E7A',C_RED='D32F2F',C_AMBER='F57F17',C_BLUE='1565C0',
      C_LIGHT='E8F5E9',C_LIGHTB='E3F2FD',C_PURPLE='6A1B9A';

// ===== ヘルパー =====
function addHeader(s,title,color=C_DARK){
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:'100%',h:0.80,fill:{color}});
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:0.14,h:0.80,fill:{color:C_LINE}});
  s.addText(title,{x:0.28,y:0,w:12.9,h:0.80,fontSize:28,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
}

function addImgPlaceholder(s,x,y,w,h,label='【ここに画像を挿入】'){
  s.addShape(pptx.ShapeType.rect,{x,y,w,h,fill:{color:'ECEFF1'},line:{color:'90A4AE',width:1.5,dashType:'dash'}});
  s.addText('📷  '+label,{x,y:y+h/2-0.25,w,h:0.50,fontSize:17,color:'90A4AE',fontFace:'Meiryo UI',align:'center',bold:true});
}

// スマホ枠 → スクリーン座標を返す
function addPhone(s,x,y,pw){
  const ph=pw*2.12,pad=pw*0.055,topH=pw*0.13,botH=pw*0.09;
  s.addShape(pptx.ShapeType.rect,{x,y,w:pw,h:ph,fill:{color:'1C1C1C'},line:{color:'555555',width:0.6}});
  const sx=x+pad,sy=y+topH,sw=pw-pad*2,sh=ph-topH-botH;
  s.addShape(pptx.ShapeType.rect,{x:sx,y:sy,w:sw,h:sh,fill:{color:'FAFAFA'}});
  s.addShape(pptx.ShapeType.rect,{x,y,w:pw,h:topH*0.55,fill:{color:'111111'}});
  s.addShape(pptx.ShapeType.ellipse,{x:x+pw/2-0.05,y:y+0.04,w:0.10,h:0.08,fill:{color:'333333'}});
  s.addShape(pptx.ShapeType.ellipse,{x:x+pw/2-0.13,y:y+ph-botH+0.03,w:0.26,h:0.13,fill:{color:'444444'}});
  return {sx,sy,sw,sh};
}

// LINEトーク画面ヘッダー
function addLineHeader(s,sx,sy,sw,title='OZONOIX'){
  s.addShape(pptx.ShapeType.rect,{x:sx,y:sy,w:sw,h:0.36,fill:{color:C_LINE}});
  s.addText('＜  '+title,{x:sx+0.08,y:sy,w:sw-0.12,h:0.36,fontSize:13,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  return sy+0.36;
}

// リッチメニュー（2行×3列）
function addRichMenu(s,sx,screenBottom,sw,btns){
  const mh=sw*0.72,my=screenBottom-mh,bw=sw/3,bh=mh/2;
  s.addShape(pptx.ShapeType.rect,{x:sx,y:my,w:sw,h:mh,fill:{color:'E0E0E0'}});
  btns.slice(0,6).forEach((b,i)=>{
    const bx=sx+(i%3)*bw,by=my+Math.floor(i/3)*bh;
    s.addShape(pptx.ShapeType.rect,{x:bx+0.02,y:by+0.02,w:bw-0.04,h:bh-0.04,fill:{color:b.bg||'FFFFFF'},line:{color:'CCCCCC',width:0.4}});
    s.addText(b.icon+'\n'+b.label,{x:bx+0.02,y:by+0.02,w:bw-0.04,h:bh-0.04,fontSize:11,color:b.tc||C_TEXT,fontFace:'Meiryo UI',align:'center',valign:'middle'});
  });
  return my;
}

// チャットふきだし
function addBubble(s,x,y,w,text,isUser=false,fs=12){
  const h=0.46,bg=isUser?C_LINE:'FFFFFF',tc=isUser?C_WHITE:C_TEXT;
  const bx=isUser?x+w-2.80:x;
  s.addShape(pptx.ShapeType.rect,{x:bx,y,w:2.80,h,fill:{color:bg},line:isUser?undefined:{color:'DDDDDD',width:0.5}});
  s.addText(text,{x:bx+0.10,y,w:2.62,h,fontSize:fs,color:tc,fontFace:'Meiryo UI',valign:'middle'});
}

// 水平フロー
function addHFlow(s,steps,x,y,totalW,h=1.10){
  const sw=totalW/steps.length;
  steps.forEach((st,i)=>{
    const sx=x+i*sw,bw=sw-0.16;
    s.addShape(pptx.ShapeType.rect,{x:sx,y,w:bw,h,fill:{color:st.bg||C_LIGHT},line:{color:st.bc||C_LINE,width:1.5}});
    s.addShape(pptx.ShapeType.ellipse,{x:sx+bw/2-0.20,y:y-0.22,w:0.40,h:0.40,fill:{color:st.bc||C_LINE}});
    s.addText(String(i+1),{x:sx+bw/2-0.20,y:y-0.22,w:0.40,h:0.40,fontSize:15,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    s.addText(st.icon||'',{x:sx+0.08,y:y+0.04,w:bw-0.14,h:0.38,fontSize:22,fontFace:'Meiryo UI',align:'center'});
    s.addText(st.label,{x:sx+0.06,y:y+0.40,w:bw-0.10,h:0.38,fontSize:15,bold:true,color:st.tc||C_TEXT,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    if(st.sub) s.addText(st.sub,{x:sx+0.06,y:y+0.76,w:bw-0.10,h:0.26,fontSize:12,color:C_SUB,fontFace:'Meiryo UI',align:'center'});
    if(i<steps.length-1) s.addText('▶',{x:sx+bw+0.01,y:y+h/2-0.14,w:0.14,h:0.28,fontSize:14,color:'888888',fontFace:'Meiryo UI',align:'center',valign:'middle'});
  });
}

function issueRow(s,x,y,w,text){
  s.addShape(pptx.ShapeType.rect,{x,y,w,h:0.62,fill:{color:'FFF8E1'},line:{color:C_AMBER,width:1}});
  s.addText('⚠️  '+text,{x:x+0.14,y,w:w-0.18,h:0.62,fontSize:16,color:'4E342E',fontFace:'Meiryo UI',valign:'middle'});
  return y+0.68;
}
function okRow(s,x,y,w,text){
  s.addShape(pptx.ShapeType.rect,{x,y,w,h:0.62,fill:{color:C_LIGHT},line:{color:C_LINE,width:1}});
  s.addText('✅  '+text,{x:x+0.14,y,w:w-0.18,h:0.62,fontSize:16,color:'1B5E20',fontFace:'Meiryo UI',valign:'middle'});
  return y+0.68;
}

// ==================== 表紙 ====================
{
  const s=pptx.addSlide();
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:'100%',h:'100%',fill:{type:'gradient',stops:[{position:0,color:'0D1B2A'},{position:100,color:'1B3A5C'}]}});
  s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:0.22,h:'100%',fill:{color:C_LINE}});
  s.addShape(pptx.ShapeType.rect,{x:0.22,y:7.0,w:'100%',h:0.50,fill:{color:C_LINE,transparency:60}});
  s.addShape(pptx.ShapeType.rect,{x:0.55,y:0.72,w:2.2,h:0.48,fill:{color:C_LINE}});
  s.addText('LINE 公式',{x:0.55,y:0.72,w:2.2,h:0.48,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
  s.addText('公式LINE 構築について',{x:0.55,y:1.40,w:10.0,h:1.30,fontSize:44,bold:true,color:C_WHITE,fontFace:'Meiryo UI'});
  s.addText('導線設計・課題整理・方向性の検討',{x:0.55,y:2.88,w:10.0,h:0.72,fontSize:26,color:'7FD8F0',fontFace:'Meiryo UI'});
  s.addShape(pptx.ShapeType.rect,{x:0.55,y:3.76,w:7.0,h:0.05,fill:{color:C_WHITE,transparency:50}});
  s.addShape(pptx.ShapeType.rect,{x:0.55,y:3.98,w:2.4,h:0.50,fill:{color:C_WHITE,transparency:80},line:{color:C_WHITE,width:0.8}});
  s.addText('会 議 資 料',{x:0.55,y:3.98,w:2.4,h:0.50,fontSize:19,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle',bold:true});
  s.addText('2026年3月',{x:0.55,y:4.66,w:4.0,h:0.44,fontSize:19,color:'B0BEC5',fontFace:'Meiryo UI'});
  // 右側：LINEロゴ風イメージ
  s.addShape(pptx.ShapeType.ellipse,{x:9.50,y:1.20,w:3.50,h:3.50,fill:{color:C_LINE,transparency:20}});
  s.addText('💬',{x:9.50,y:1.20,w:3.50,h:3.50,fontSize:80,fontFace:'Meiryo UI',align:'center',valign:'middle'});
}

// ==================== 目次 ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'📋  目次',C_DARK);
  const items=[
    {num:'議題 1',title:'現在の公式LINEの外観',sub:'アカウントデザイン・現状確認',color:C_LINE},
    {num:'議題 2',title:'LINE登録からお問い合わせまでの導線',sub:'挨拶メッセージ / 方向性A・Bの比較検討',color:C_BLUE},
    {num:'議題 3',title:'提供方法と解決案',sub:'プロセスの課題・事前大量生産による時間短縮',color:C_PURPLE},
    {num:'議題 4',title:'OZONOIX公式LINEの機能設計',sub:'配信コンテンツ・リッチメニュー・HP連携',color:'00695C'},
    {num:'議題 5',title:'店舗シフトアプリ用LINEの構造',sub:'機能・無料プラン内収め方の対策',color:'4527A0'},
    {num:'議題 6',title:'公式LINEの宣伝（LINE広告）',sub:'成果報酬型広告・補助金の検討',color:C_AMBER},
  ];
  items.forEach((item,i)=>{
    const col=i%2,row=Math.floor(i/2),x=0.25+col*6.55,y=0.92+row*2.12;
    s.addShape(pptx.ShapeType.rect,{x,y,w:6.3,h:1.90,fill:{color:C_WHITE},line:{color:item.color,width:2}});
    s.addShape(pptx.ShapeType.rect,{x,y,w:1.40,h:1.90,fill:{color:item.color}});
    s.addText(item.num,{x,y,w:1.40,h:1.90,fontSize:16,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    s.addText(item.title,{x:x+1.52,y:y+0.25,w:4.62,h:0.60,fontSize:19,bold:true,color:C_TEXT,fontFace:'Meiryo UI',valign:'middle'});
    s.addText(item.sub,{x:x+1.52,y:y+0.95,w:4.62,h:0.44,fontSize:15,color:C_SUB,fontFace:'Meiryo UI'});
  });
}

// ==================== 議題1：LINEの外観（画像3枚プレースホルダー）====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 1　現在の公式LINEの外観',C_LINE);
  s.addText('現在のアカウントデザイン・プロフィール・メニュー構成を確認します',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  // スマホ枠3つにプレースホルダー
  const phones=[
    {x:0.50,label:'LINEプロフィール画面'},
    {x:4.90,label:'リッチメニュー・ホーム画面'},
    {x:9.30,label:'その他（任意）'},
  ];
  phones.forEach(p=>{
    const {sx,sy,sw,sh}=addPhone(s,p.x,1.30,3.50);
    addImgPlaceholder(s,sx,sy,sw,sh,p.label);
  });
}

// ==================== 議題2-①：挨拶メッセージ ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 2　現状の挨拶メッセージ（友だち追加時に自動送信）',C_BLUE);
  s.addText('友だち追加直後に届くメッセージが、その後の行動を決める最重要ポイントです',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  // 左：スマホ＋チャット画面
  const {sx,sy,sw,sh}=addPhone(s,0.28,1.36,3.30);
  const chatY=addLineHeader(s,sx,sy,sw);
  // ステータスバー
  s.addShape(pptx.ShapeType.rect,{x:sx,y:chatY,w:sw,h:sh-chatY+sy-sw*0.70,fill:{color:'F0F4F8'}});
  // 挨拶メッセージプレースホルダー（ふきだし風）
  const phY=chatY+0.12;
  s.addShape(pptx.ShapeType.rect,{x:sx+0.06,y:phY,w:sw-0.12,h:sh-0.48-sw*0.70-0.12,fill:{color:'ECEFF1'},line:{color:'90A4AE',width:1,dashType:'dash'}});
  s.addText('📷 挨拶メッセージ\n画像をここに挿入',{x:sx+0.06,y:phY,w:sw-0.12,h:sh-0.48-sw*0.70-0.12,fontSize:12,color:'90A4AE',fontFace:'Meiryo UI',align:'center',valign:'middle'});
  // リッチメニュースタブ
  addRichMenu(s,sx,sy+sh,sw,[
    {icon:'📬',label:'問合せ',bg:'E8F5E9',tc:'1B5E20'},
    {icon:'🛍️',label:'商品',bg:'E3F2FD',tc:C_BLUE},
    {icon:'🏢',label:'会社',bg:'F3E5F5',tc:C_PURPLE},
    {icon:'❓',label:'Q&A',bg:'FFF8E1',tc:'4E342E'},
    {icon:'🎟️',label:'クーポン',bg:'FCE4EC',tc:C_RED},
    {icon:'＋',label:'検討中',bg:'F5F5F5',tc:C_SUB},
  ]);

  // 右：説明
  const tx=3.88,tw=9.20;
  s.addShape(pptx.ShapeType.rect,{x:tx,y:1.36,w:tw,h:0.52,fill:{color:C_BLUE}});
  s.addText('挨拶メッセージの役割',{x:tx+0.14,y:1.36,w:tw-0.18,h:0.52,fontSize:20,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  const pts=[
    '👤  友だち追加直後に届く「第一印象」のメッセージ',
    '🎯  次のアクション（問い合わせ・登録）への誘導が鍵',
    '📲  ボタン・画像・テキストを組み合わせて構成できる',
    '⚡  ここでの導線設計がその後の成約率に直結する',
  ];
  pts.forEach((p,i)=>{
    s.addShape(pptx.ShapeType.rect,{x:tx,y:2.00+i*0.90,w:tw,h:0.78,fill:{color:i%2===0?C_LIGHTB:'F8FBFF'},line:{color:C_BLUE,width:0.5}});
    s.addText(p,{x:tx+0.14,y:2.00+i*0.90,w:tw-0.18,h:0.78,fontSize:18,color:C_TEXT,fontFace:'Meiryo UI',valign:'middle'});
  });
  s.addShape(pptx.ShapeType.rect,{x:tx,y:5.68,w:tw,h:0.60,fill:{color:'FFF8E1'},line:{color:C_AMBER,width:1}});
  s.addText('⚠️  ここでの誘導がその後の導線に直結します',{x:tx+0.14,y:5.68,w:tw-0.18,h:0.60,fontSize:18,bold:true,color:'4E342E',fontFace:'Meiryo UI',valign:'middle'});
}

// ==================== 議題2-②：方向性A vs B ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 2　導線の方向性　― 2つの選択肢',C_DARK);
  s.addText('LINE登録後、お問い合わせまでをどのように設計するか？',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  // VS バッジ中央
  s.addShape(pptx.ShapeType.ellipse,{x:6.16,y:3.50,w:0.88,h:0.88,fill:{color:C_DARK}});
  s.addText('VS',{x:6.16,y:3.50,w:0.88,h:0.88,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});

  // 方向性A（左）
  s.addShape(pptx.ShapeType.rect,{x:0.28,y:1.42,w:5.76,h:5.70,fill:{color:C_WHITE},line:{color:C_LINE,width:2}});
  s.addShape(pptx.ShapeType.rect,{x:0.28,y:1.42,w:5.76,h:0.58,fill:{color:C_LINE}});
  s.addText('💬  方向性 A　LINEで直接進める',{x:0.40,y:1.42,w:5.54,h:0.58,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  const stA=[
    {icon:'👤',label:'友だち追加',bg:C_LIGHT,bc:C_LINE},
    {icon:'📩',label:'挨拶メッセージ',bg:C_LIGHT,bc:C_LINE},
    {icon:'💬',label:'LINEトーク\nで案内',bg:C_LIGHT,bc:C_LINE},
    {icon:'✍️',label:'そのまま\nLINEで契約',bg:C_LIGHT,bc:C_LINE},
  ];
  stA.forEach((st,i)=>{
    s.addShape(pptx.ShapeType.rect,{x:0.48,y:2.12+i*0.84,w:5.44,h:0.72,fill:{color:st.bg},line:{color:st.bc,width:1}});
    s.addText(st.icon+'  '+st.label,{x:0.62,y:2.12+i*0.84,w:5.20,h:0.72,fontSize:17,bold:true,color:'1B5E20',fontFace:'Meiryo UI',valign:'middle'});
    if(i<stA.length-1) s.addText('▼',{x:0.48,y:2.80+i*0.84,w:5.44,h:0.16,fontSize:14,color:C_LINE,fontFace:'Meiryo UI',align:'center'});
  });

  // 方向性B（右）
  s.addShape(pptx.ShapeType.rect,{x:7.16,y:1.42,w:5.90,h:5.70,fill:{color:C_WHITE},line:{color:C_BLUE,width:2}});
  s.addShape(pptx.ShapeType.rect,{x:7.16,y:1.42,w:5.90,h:0.58,fill:{color:C_BLUE}});
  s.addText('📋  方向性 B　フォーム経由で進める',{x:7.28,y:1.42,w:5.68,h:0.58,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  const stB=[
    {icon:'👤',label:'友だち追加',bg:C_LIGHTB,bc:C_BLUE},
    {icon:'📩',label:'挨拶メッセージ',bg:C_LIGHTB,bc:C_BLUE},
    {icon:'🔗',label:'フォームURLへ\n誘導',bg:'FFF8E1',bc:C_AMBER},
    {icon:'📝',label:'フォーム入力',bg:C_LIGHTB,bc:C_BLUE},
    {icon:'📞',label:'個別にLINEで\n連絡・契約',bg:C_LIGHTB,bc:C_BLUE},
  ];
  stB.forEach((st,i)=>{
    s.addShape(pptx.ShapeType.rect,{x:7.28,y:2.12+i*0.68,w:5.66,h:0.58,fill:{color:st.bg},line:{color:st.bc,width:1}});
    s.addText(st.icon+'  '+st.label,{x:7.40,y:2.12+i*0.68,w:5.42,h:0.58,fontSize:16,bold:true,color:'0D3C6E',fontFace:'Meiryo UI',valign:'middle'});
    if(i<stB.length-1) s.addText('▼',{x:7.28,y:2.66+i*0.68,w:5.66,h:0.14,fontSize:13,color:C_BLUE,fontFace:'Meiryo UI',align:'center'});
  });
}

// ==================== 方向性Aの課題 ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'方向性 A　LINEで直接進める ― 課題・制約',C_LINE);

  // 左：課題の核心を視覚化
  s.addShape(pptx.ShapeType.rect,{x:0.28,y:0.96,w:5.80,h:6.16,fill:{color:C_WHITE},line:{color:C_LINE,width:1.5}});

  // 200通制限ビジュアル
  s.addShape(pptx.ShapeType.rect,{x:0.40,y:1.06,w:5.56,h:0.48,fill:{color:C_LINE}});
  s.addText('💬  無料プラン　月200通の壁',{x:0.52,y:1.06,w:5.34,h:0.48,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});

  // プログレスバー風
  s.addShape(pptx.ShapeType.rect,{x:0.52,y:1.66,w:5.24,h:0.32,fill:{color:'E0E0E0'}});
  s.addShape(pptx.ShapeType.rect,{x:0.52,y:1.66,w:5.24*0.72,h:0.32,fill:{color:C_LINE}});
  s.addText('144通 送信済',{x:0.54,y:1.66,w:2.60,h:0.32,fontSize:13,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle',bold:true});
  s.addText('残り56通',{x:4.40,y:1.66,w:1.20,h:0.32,fontSize:13,color:C_RED,fontFace:'Meiryo UI',valign:'middle',bold:true});
  s.addText('※ 200通超えると有料プランが必要',{x:0.52,y:2.06,w:5.24,h:0.30,fontSize:13,color:C_RED,fontFace:'Meiryo UI'});

  // LINE⇔サイト往復イメージ
  s.addShape(pptx.ShapeType.rect,{x:0.40,y:2.48,w:5.56,h:0.42,fill:{color:'ECEFF1'}});
  s.addText('🔄  LINEとサイトの往復イメージ',{x:0.52,y:2.48,w:5.34,h:0.42,fontSize:16,bold:true,color:C_DARK,fontFace:'Meiryo UI',valign:'middle'});

  const flow2=[
    {icon:'💬',label:'LINE',color:C_LINE,tc:C_WHITE},
    {icon:'🌐',label:'外部サイト',color:C_BLUE,tc:C_WHITE},
    {icon:'💬',label:'LINE',color:C_LINE,tc:C_WHITE},
    {icon:'🌐',label:'外部サイト',color:C_BLUE,tc:C_WHITE},
  ];
  flow2.forEach((f,i)=>{
    const fx=0.48+i*1.38;
    s.addShape(pptx.ShapeType.rect,{x:fx,y:3.02,w:1.22,h:1.00,fill:{color:f.color}});
    s.addText(f.icon+'\n'+f.label,{x:fx,y:3.02,w:1.22,h:1.00,fontSize:14,bold:true,color:f.tc,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    if(i<flow2.length-1) s.addText('⇄',{x:fx+1.22,y:3.36,w:0.16,h:0.32,fontSize:16,color:C_RED,fontFace:'Meiryo UI',align:'center'});
  });
  s.addText('⚠️ 離脱リスクが高まる',{x:0.48,y:4.14,w:5.44,h:0.34,fontSize:14,color:C_RED,bold:true,fontFace:'Meiryo UI',align:'center'});

  // 費用上昇グラフ風
  s.addShape(pptx.ShapeType.rect,{x:0.40,y:4.58,w:5.56,h:0.40,fill:{color:'ECEFF1'}});
  s.addText('📈  登録者増加 → コスト増大',{x:0.52,y:4.58,w:5.34,h:0.40,fontSize:16,bold:true,color:C_DARK,fontFace:'Meiryo UI',valign:'middle'});
  [1,2,3,4,5].forEach((v,i)=>{
    const bh=v*0.20+0.10,bx=0.62+i*1.02,by=5.62-bh;
    s.addShape(pptx.ShapeType.rect,{x:bx,y:by,w:0.76,h:bh,fill:{color:i>2?C_RED:C_AMBER}});
    s.addText(['無料','無料','⚠️','💴','💴💴'][i],{x:bx,y:by-0.22,w:0.76,h:0.20,fontSize:11,color:i>2?C_RED:C_AMBER,fontFace:'Meiryo UI',align:'center'});
  });

  // 右：課題まとめ
  s.addShape(pptx.ShapeType.rect,{x:6.32,y:0.96,w:6.73,h:0.48,fill:{color:C_AMBER}});
  s.addText('⚠️  課題まとめ',{x:6.46,y:0.96,w:6.50,h:0.48,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  let cy=1.54;
  [
    '無料プランは月200通まで。登録者が増えるほど有料化が必要になる',
    '支払い・申し込みなど重要なステップは外部サイトへの遷移が必須で、LINEだけでは完結しない',
    'LINE→外部サイト→LINEという往復が発生し、途中離脱のリスクが高まる',
    'メッセージ数が増えるほどコストが直線的に増大していく',
  ].forEach(t=>{ cy=issueRow(s,6.32,cy,6.73,t); });
}

// ==================== 方向性Bの課題 ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'方向性 B　フォーム経由で進める ― 課題・制約',C_BLUE);

  // 左：往復イメージ図
  s.addShape(pptx.ShapeType.rect,{x:0.28,y:0.96,w:5.80,h:6.16,fill:{color:C_WHITE},line:{color:C_BLUE,width:1.5}});
  s.addShape(pptx.ShapeType.rect,{x:0.40,y:1.06,w:5.56,h:0.46,fill:{color:C_BLUE}});
  s.addText('🔄  ユーザーの動線イメージ',{x:0.52,y:1.06,w:5.34,h:0.46,fontSize:17,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});

  // 3種の導入経路
  const routes=[
    {from:'🌐 Webサイト',arrow:'→ LINE登録',then:'→ フォームへ戻る　⚠️逆戻り！',bc:C_AMBER},
    {from:'📱 SNS広告',arrow:'→ LINE登録',then:'→ フォームURLへ　✅比較的スムーズ',bc:C_LINE},
    {from:'🤝 口コミ',arrow:'→ LINE登録',then:'→ フォームURLへ　✅比較的スムーズ',bc:C_LINE},
  ];
  routes.forEach((r,i)=>{
    const ry=1.66+i*1.48;
    s.addShape(pptx.ShapeType.rect,{x:0.48,y:ry,w:1.70,h:0.62,fill:{color:'E3F2FD'},line:{color:C_BLUE,width:1}});
    s.addText(r.from,{x:0.52,y:ry,w:1.64,h:0.62,fontSize:14,bold:true,color:C_BLUE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    s.addText('→',{x:2.20,y:ry+0.18,w:0.30,h:0.26,fontSize:16,color:'888888',fontFace:'Meiryo UI',align:'center'});
    s.addShape(pptx.ShapeType.rect,{x:2.52,y:ry,w:1.50,h:0.62,fill:{color:C_LIGHT},line:{color:C_LINE,width:1}});
    s.addText('📲 LINE登録',{x:2.54,y:ry,w:1.46,h:0.62,fontSize:13,bold:true,color:'1B5E20',fontFace:'Meiryo UI',align:'center',valign:'middle'});
    s.addText('→',{x:4.04,y:ry+0.18,w:0.30,h:0.26,fontSize:16,color:'888888',fontFace:'Meiryo UI',align:'center'});
    s.addShape(pptx.ShapeType.rect,{x:4.36,y:ry,w:1.52,h:0.62,fill:{color:i===0?'FFF3E0':C_LIGHTB},line:{color:r.bc,width:1}});
    s.addText('📝 フォーム',{x:4.38,y:ry,w:1.48,h:0.62,fontSize:13,bold:true,color:i===0?'4E342E':'0D3C6E',fontFace:'Meiryo UI',align:'center',valign:'middle'});
    s.addText(r.then,{x:0.48,y:ry+0.68,w:5.44,h:0.30,fontSize:13,color:i===0?C_AMBER:'1B5E20',fontFace:'Meiryo UI'});
  });

  // 新規URL作成コスト
  s.addShape(pptx.ShapeType.rect,{x:0.40,y:6.18,w:5.56,h:0.72,fill:{color:'FFF8E1'},line:{color:C_AMBER,width:1}});
  s.addText('⚠️  新規フォームURLの作成・管理コストが発生する',{x:0.52,y:6.18,w:5.34,h:0.72,fontSize:15,color:'4E342E',fontFace:'Meiryo UI',valign:'middle'});

  // 右：課題まとめ
  s.addShape(pptx.ShapeType.rect,{x:6.32,y:0.96,w:6.73,h:0.48,fill:{color:C_AMBER}});
  s.addText('⚠️  課題まとめ',{x:6.46,y:0.96,w:6.50,h:0.48,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  let cy=1.54;
  [
    '新たにお問い合わせフォームのURL作成・設置が必要になる',
    'Webサイト経由でLINE登録したユーザーを再度フォーム（Web）に戻す構図になり、本末転倒になるケースがある',
    'LINE登録後にまたブラウザを開かせるため、ユーザーの手間が増え離脱リスクが生まれる',
    'フォームとLINEの2系統を管理するため運用の手間が2倍になる',
  ].forEach(t=>{ cy=issueRow(s,6.32,cy,6.73,t); });
}

// ==================== 比較まとめ ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'方向性 A・B　比較まとめ',C_DARK);
  const cols=[
    {label:'比較項目',x:0.28,w:2.80,bg:C_DARK},
    {label:'方向性 A（LINE直接）',x:3.18,w:4.70,bg:C_LINE},
    {label:'方向性 B（フォーム経由）',x:7.98,w:5.07,bg:C_BLUE},
  ];
  cols.forEach(c=>{
    s.addShape(pptx.ShapeType.rect,{x:c.x,y:0.92,w:c.w,h:0.56,fill:{color:c.bg}});
    s.addText(c.label,{x:c.x+0.10,y:0.92,w:c.w-0.14,h:0.56,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle',align:'center'});
  });
  const rows=[
    {item:'操作\nシンプルさ',
     a:{text:'◎ LINE内でほぼ完結',color:C_LIGHT,tc:'1B5E20'},
     b:{text:'△ フォーム→LINE戻りが発生',color:'FFF8E1',tc:'4E342E'}},
    {item:'コスト\n（月額）',
     a:{text:'× 月200通超で有料化',color:'FFEBEE',tc:C_RED},
     b:{text:'◎ 一斉配信不要で制限回避しやすい',color:C_LIGHT,tc:'1B5E20'}},
    {item:'離脱\nリスク',
     a:{text:'△ 外部サイト遷移で離脱の可能性',color:'FFF8E1',tc:'4E342E'},
     b:{text:'△ フォーム誘導時に離脱の可能性',color:'FFF8E1',tc:'4E342E'}},
    {item:'顧客情報\n収集',
     a:{text:'△ 情報収集が難しい',color:'FFF8E1',tc:'4E342E'},
     b:{text:'◎ フォームで整理して収集できる',color:C_LIGHT,tc:'1B5E20'}},
    {item:'新規開発\n必要性',
     a:{text:'◎ 既存LINEのみでOK',color:C_LIGHT,tc:'1B5E20'},
     b:{text:'× フォームURL新規作成が必要',color:'FFEBEE',tc:C_RED}},
    {item:'拡張性',
     a:{text:'△ 有料プラン移行が前提になる',color:'FFF8E1',tc:'4E342E'},
     b:{text:'◎ CRM連携など将来的に拡張しやすい',color:C_LIGHT,tc:'1B5E20'}},
  ];
  rows.forEach((r,i)=>{
    const ry=1.58+i*0.94,bg=i%2===0?C_WHITE:'F9F9F9';
    s.addShape(pptx.ShapeType.rect,{x:0.28,y:ry,w:2.80,h:0.84,fill:{color:bg},line:{color:'DDDDDD',width:0.5}});
    s.addText(r.item,{x:0.34,y:ry,w:2.68,h:0.84,fontSize:16,bold:true,color:C_TEXT,fontFace:'Meiryo UI',valign:'middle',align:'center'});
    s.addShape(pptx.ShapeType.rect,{x:3.18,y:ry,w:4.70,h:0.84,fill:{color:r.a.color},line:{color:'CCCCCC',width:0.5}});
    s.addText(r.a.text,{x:3.30,y:ry,w:4.50,h:0.84,fontSize:16,color:r.a.tc,fontFace:'Meiryo UI',valign:'middle'});
    s.addShape(pptx.ShapeType.rect,{x:7.98,y:ry,w:5.07,h:0.84,fill:{color:r.b.color},line:{color:'CCCCCC',width:0.5}});
    s.addText(r.b.text,{x:8.10,y:ry,w:4.88,h:0.84,fontSize:16,color:r.b.tc,fontFace:'Meiryo UI',valign:'middle'});
  });
}

// ==================== 議論スライド ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議論　方向性を決めるための論点',C_DARK);
  const pts=[
    {q:'月のメッセージ数はどのくらいを想定するか？',detail:'200通/月を超える見込みなら有料プランへの移行コストを事前試算する必要があります'},
    {q:'フォームを新規作成するリソース・コストは確保できるか？',detail:'Googleフォーム等の無料サービスを活用することで低コスト構築も可能です'},
    {q:'ユーザーにとって最もスムーズな体験はどちらか？',detail:'LINE内完結 vs フォームで情報整理、どちらのUXを優先するか判断が必要です'},
    {q:'将来的な拡張性（CRM連携・顧客管理）を視野に入れるか？',detail:'フォーム経由の方が顧客情報を整理しやすく、将来の拡張に向いています'},
  ];
  pts.forEach((p,i)=>{
    const py=0.92+i*1.52;
    s.addShape(pptx.ShapeType.rect,{x:0.28,y:py,w:12.77,h:1.36,fill:{color:C_WHITE},line:{color:C_DARK,width:1}});
    s.addShape(pptx.ShapeType.rect,{x:0.28,y:py,w:0.52,h:1.36,fill:{color:C_DARK}});
    s.addText('Q',{x:0.28,y:py,w:0.52,h:1.36,fontSize:22,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    s.addText(p.q,{x:0.94,y:py+0.06,w:12.00,h:0.54,fontSize:19,bold:true,color:C_TEXT,fontFace:'Meiryo UI',valign:'middle'});
    s.addText(p.detail,{x:0.94,y:py+0.66,w:12.00,h:0.58,fontSize:16,color:C_SUB,fontFace:'Meiryo UI',valign:'middle'});
  });
}

// ==================== 議題3①：提供フロー ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 3　提供方法 ― サービス提供の全体フロー',C_PURPLE);
  s.addText('お客様へ公式LINEを届けるまでのプロセスと課題を整理します',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  addHFlow(s,[
    {icon:'📋',label:'プラン選択',sub:'希望プランを入力',bg:'EDE7F6',bc:C_PURPLE,tc:C_PURPLE},
    {icon:'💳',label:'支払い登録',sub:'決済完了',bg:'EDE7F6',bc:C_PURPLE,tc:C_PURPLE},
    {icon:'🛠️',label:'LINE作成',sub:'店舗専用アカウント構築',bg:'FFF3E0',bc:C_AMBER,tc:'4E342E'},
    {icon:'✏️',label:'情報反映',sub:'名前・プランを設定',bg:'FFF3E0',bc:C_AMBER,tc:'4E342E'},
    {icon:'🎉',label:'納品・提供',sub:'店舗様に引き渡し',bg:C_LIGHT,bc:'2E7D32',tc:'2E7D32'},
  ],0.28,1.56,12.77,1.34);

  // 問題矢印
  s.addText('⬆️ ここに時間がかかる',{x:4.30,y:3.08,w:4.60,h:0.34,fontSize:15,color:C_RED,fontFace:'Meiryo UI',align:'center',bold:true});

  s.addShape(pptx.ShapeType.rect,{x:0.28,y:3.52,w:12.77,h:0.46,fill:{color:C_AMBER}});
  s.addText('⚠️  課題・問題点',{x:0.40,y:3.52,w:12.50,h:0.46,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  let cy=4.08;
  ['店舗ごとに個別対応が必要なため、支払い完了後すぐには提供できない',
   '作成・カスタマイズ作業に一定の時間がかかり、お客様を待たせてしまう'].forEach(t=>{ cy=issueRow(s,0.28,cy,12.77,t); });
}

// ==================== 議題3②：解決案 ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 3　解決案 ― 事前大量生産による時間短縮','2E7D32');

  s.addShape(pptx.ShapeType.rect,{x:0.28,y:0.90,w:12.77,h:0.58,fill:{color:'2E7D32'}});
  s.addText('💡  解決案：ベースとなる公式LINEを事前に大量生産し、受注後に店舗情報を流し込む',{x:0.42,y:0.90,w:12.50,h:0.58,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});

  // 従来 vs 改善後
  // 従来（上段）
  s.addShape(pptx.ShapeType.rect,{x:0.28,y:1.60,w:1.40,h:4.60,fill:{color:C_AMBER}});
  s.addText('従\n来',{x:0.28,y:1.60,w:1.40,h:4.60,fontSize:20,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
  addHFlow(s,[
    {icon:'📥',label:'受注',bg:'FFF8E1',bc:C_AMBER,tc:'4E342E'},
    {icon:'🛠️',label:'一から作成',sub:'時間がかかる',bg:'FFF3E0',bc:C_RED,tc:C_RED},
    {icon:'✏️',label:'情報入力',bg:'FFF3E0',bc:C_AMBER,tc:'4E342E'},
    {icon:'🔍',label:'確認・修正',bg:'FFF3E0',bc:C_AMBER,tc:'4E342E'},
    {icon:'📦',label:'納品',sub:'⏰ 時間大',bg:'FFF8E1',bc:C_AMBER,tc:'4E342E'},
  ],1.84,1.90,10.96,1.10);

  // 矢印
  s.addText('⬇️  改善',{x:5.80,y:3.18,w:1.60,h:0.38,fontSize:18,bold:true,color:'2E7D32',fontFace:'Meiryo UI',align:'center'});

  // 改善後（下段）
  s.addShape(pptx.ShapeType.rect,{x:0.28,y:3.66,w:1.40,h:3.00,fill:{color:'2E7D32'}});
  s.addText('改\n善\n後',{x:0.28,y:3.66,w:1.40,h:3.00,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});

  // 事前準備（別枠）
  s.addShape(pptx.ShapeType.rect,{x:1.84,y:3.66,w:2.60,h:2.72,fill:{color:'E8F5E9'},line:{color:'2E7D32',width:1.5}});
  s.addShape(pptx.ShapeType.rect,{x:1.84,y:3.66,w:2.60,h:0.42,fill:{color:'2E7D32'}});
  s.addText('事前（空き時間）',{x:1.90,y:3.66,w:2.48,h:0.42,fontSize:15,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  s.addText('🏭',{x:1.84,y:4.14,w:2.60,h:0.60,fontSize:28,fontFace:'Meiryo UI',align:'center'});
  s.addText('テンプレートLINEを\n大量に作成しておく',{x:1.90,y:4.76,w:2.48,h:0.64,fontSize:15,bold:true,color:'1B5E20',fontFace:'Meiryo UI',align:'center',valign:'middle'});

  s.addText('＋',{x:4.50,y:4.70,w:0.42,h:0.60,fontSize:24,color:C_DARK,fontFace:'Meiryo UI',align:'center',valign:'middle'});

  addHFlow(s,[
    {icon:'📥',label:'受注',bg:C_LIGHT,bc:'2E7D32',tc:'1B5E20'},
    {icon:'✏️',label:'情報書き換え\nのみ',sub:'⚡ 速い！',bg:C_LIGHT,bc:'2E7D32',tc:'1B5E20'},
    {icon:'📦',label:'即納品',sub:'🎉 大幅短縮',bg:C_LIGHT,bc:'2E7D32',tc:'1B5E20'},
  ],4.96,3.96,7.84,1.10);

  // 残課題
  s.addShape(pptx.ShapeType.rect,{x:0.28,y:6.76,w:12.77,h:0.56,fill:{color:'FFF8E1'},line:{color:C_AMBER,width:1}});
  s.addText('⚠️  残課題：公式LINEアカウント自体の作成に手間がかかる点は引き続き検討が必要',{x:0.42,y:6.76,w:12.50,h:0.56,fontSize:16,color:'4E342E',fontFace:'Meiryo UI',valign:'middle'});
}

// ==================== 議題4：OZONOIX公式LINE機能 ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 4　OZONOIX公式LINE ― 機能・リッチメニュー設計','00695C');
  s.addText('OZONOIXとしての公式LINEに搭載する機能を整理・検討します',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  // 左：スマホ＋リッチメニュー
  const pw=3.10;
  const {sx,sy,sw,sh}=addPhone(s,0.28,1.36,pw);
  const chatAreaY=addLineHeader(s,sx,sy,sw,'OZONOIX公式');
  // チャットエリア（吹き出し例）
  s.addShape(pptx.ShapeType.rect,{x:sx,y:chatAreaY,w:sw,h:sh-(sw*0.72),fill:{color:'F0F4F8'}});
  addBubble(s,sx+0.06,chatAreaY+0.14,sw-0.12,'🎟️ 今だけクーポン！\n本日限定20%OFF',false,10);
  addBubble(s,sx+0.06,chatAreaY+0.82,sw-0.12,'📦 新商材のご紹介',false,10);

  const menuBtns=[
    {icon:'📬',label:'お問い合わせ',bg:'E8F5E9',tc:'1B5E20'},
    {icon:'🛍️',label:'商品紹介',bg:'E3F2FD',tc:C_BLUE},
    {icon:'🏢',label:'会社情報',bg:'F3E5F5',tc:C_PURPLE},
    {icon:'❓',label:'Q&A',bg:'FFF8E1',tc:'4E342E'},
    {icon:'🎟️',label:'クーポン',bg:'FCE4EC',tc:C_RED},
    {icon:'＋',label:'検討中',bg:'F5F5F5',tc:C_SUB},
  ];
  addRichMenu(s,sx,sy+sh,sw,menuBtns);

  // 右：機能説明
  const tx=3.68,tw=9.40;
  s.addShape(pptx.ShapeType.rect,{x:tx,y:1.36,w:tw,h:0.50,fill:{color:'00695C'}});
  s.addText('📢  配信コンテンツ（メッセージ）',{x:tx+0.14,y:1.36,w:tw-0.18,h:0.50,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  [
    {icon:'📦',t:'定期的な商材・新サービスの紹介（月1〜2回程度）'},
    {icon:'🎟️',t:'今だけクーポン・登録者限定の特典配信'},
    {icon:'📰',t:'会社ニュース・お知らせ・イベント告知'},
  ].forEach((c,i)=>{
    s.addShape(pptx.ShapeType.rect,{x:tx,y:1.96+i*0.70,w:tw,h:0.62,fill:{color:'E0F2F1'},line:{color:'00695C',width:0.5}});
    s.addText(c.icon+'  '+c.t,{x:tx+0.14,y:1.96+i*0.70,w:tw-0.18,h:0.62,fontSize:17,color:'004D40',fontFace:'Meiryo UI',valign:'middle'});
  });

  s.addShape(pptx.ShapeType.rect,{x:tx,y:4.12,w:tw,h:0.50,fill:{color:'00695C'}});
  s.addText('📱  リッチメニュー構成（案）',{x:tx+0.14,y:4.12,w:tw-0.18,h:0.50,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  const menus=[
    {icon:'📬',t:'お問い合わせ',note:'問い合わせフォームorトーク起動'},
    {icon:'🛍️',t:'商品紹介',note:'プロダクトHPへ遷移　※HP側の表示変更が必要',warn:true},
    {icon:'🏢',t:'会社情報',note:'OZONOIX概要・代表挨拶など'},
    {icon:'❓',t:'Q&A（よくある質問）',note:'FAQ一覧・外部ページへ遷移'},
    {icon:'＋',t:'追加検討枠',note:'導入事例・SNSリンク・スタッフ紹介など（議論）',warn:true},
  ];
  menus.forEach((m,i)=>{
    const bg=m.warn?'FFF8E1':'E0F2F1',bc=m.warn?C_AMBER:'00695C';
    s.addShape(pptx.ShapeType.rect,{x:tx,y:4.72+i*0.52,w:tw,h:0.46,fill:{color:bg},line:{color:bc,width:0.8}});
    s.addText((m.warn?'⚠️ ':'✅ ')+m.icon+'  '+m.t+'　―　'+m.note,{x:tx+0.14,y:4.72+i*0.52,w:tw-0.18,h:0.46,fontSize:15,color:m.warn?'4E342E':'004D40',fontFace:'Meiryo UI',valign:'middle'});
  });
}

// ==================== 議題4補足：HP表示変更 ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 4　補足 ― 商品紹介時のHP表示変更の必要性','00695C');
  s.addText('LINE経由でHPに遷移した際、既存登録者向けの表示を分ける必要があります',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  // ブラウザ枠ヘルパー
  function addBrowser(s,x,y,w,h,title,color){
    s.addShape(pptx.ShapeType.rect,{x,y,w,h,fill:{color:'FFFFFF'},line:{color:'CCCCCC',width:1}});
    s.addShape(pptx.ShapeType.rect,{x,y,w,h:0.38,fill:{color:'EEEEEE'}});
    s.addShape(pptx.ShapeType.ellipse,{x:x+0.10,y:y+0.10,w:0.16,h:0.16,fill:{color:C_RED}});
    s.addShape(pptx.ShapeType.ellipse,{x:x+0.32,y:y+0.10,w:0.16,h:0.16,fill:{color:C_AMBER}});
    s.addShape(pptx.ShapeType.ellipse,{x:x+0.54,y:y+0.10,w:0.16,h:0.16,fill:{color:C_LINE}});
    s.addShape(pptx.ShapeType.rect,{x:x+0.80,y:y+0.09,w:w-0.96,h:0.20,fill:{color:'FFFFFF'},line:{color:'CCCCCC',width:0.5}});
    s.addText('🔗 '+title,{x:x+0.84,y:y+0.09,w:w-1.00,h:0.20,fontSize:11,color:C_SUB,fontFace:'Meiryo UI',valign:'middle'});
    s.addShape(pptx.ShapeType.rect,{x,y:y+0.38,w,h:0.36,fill:{color}});
  }

  // 現状（左）
  addBrowser(s,0.28,1.40,5.90,5.72,'product.ozonoix.com',C_SUB);
  s.addText('【現状】新規ユーザー向けのみ',{x:0.40,y:1.78,w:5.66,h:0.36,fontSize:16,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle',align:'center'});
  [
    {t:'サービス説明（初めての方向け）',ok:null},
    {t:'料金・プラン一覧',ok:null},
    {t:'申し込みフォームへ誘導',ok:null},
    {t:'⚠️ LINE登録済みユーザーにも\n同じ内容が表示される',ok:false},
    {t:'⚠️ 「また最初から…」と感じさせる',ok:false},
  ].forEach((r,i)=>{
    const bg=r.ok===false?'FFEBEE':i%2===0?'F5F5F5':C_WHITE;
    const tc=r.ok===false?C_RED:C_TEXT;
    s.addShape(pptx.ShapeType.rect,{x:0.40,y:2.24+i*0.80,w:5.66,h:0.72,fill:{color:bg},line:{color:'DDDDDD',width:0.5}});
    s.addText(r.t,{x:0.52,y:2.24+i*0.80,w:5.42,h:0.72,fontSize:15,color:tc,fontFace:'Meiryo UI',valign:'middle'});
  });

  // 矢印
  s.addText('→\n改善',{x:6.28,y:3.80,w:0.80,h:0.90,fontSize:18,bold:true,color:'2E7D32',fontFace:'Meiryo UI',align:'center',valign:'middle'});

  // 改善後（右）
  addBrowser(s,7.18,1.40,5.88,5.72,'product.ozonoix.com?ref=line',C_LINE);
  s.addText('【改善後】登録者向け表示',{x:7.30,y:1.78,w:5.64,h:0.36,fontSize:16,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle',align:'center'});
  [
    {t:'✅ 「ようこそ！登録済みのお客様へ」\n専用メッセージを表示',ok:true},
    {t:'✅ 会員限定商品・特典ページを優先表示',ok:true},
    {t:'✅ 新規向けの長い説明をスキップ',ok:true},
    {t:'⚠️ LINE経由URLにパラメータ付与が必要\n（開発対応が必要）',ok:false},
  ].forEach((r,i)=>{
    const bg=r.ok?C_LIGHT:'FFF8E1';
    const tc=r.ok?'1B5E20':'4E342E';
    s.addShape(pptx.ShapeType.rect,{x:7.30,y:2.24+i*1.10,w:5.64,h:1.00,fill:{color:bg},line:{color:r.ok?C_LINE:C_AMBER,width:0.8}});
    s.addText(r.t,{x:7.42,y:2.24+i*1.10,w:5.42,h:1.00,fontSize:15,color:tc,fontFace:'Meiryo UI',valign:'middle'});
  });
}

// ==================== 議題5：店舗シフトアプリLINE ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 5　店舗シフトアプリ用 公式LINE の構造','4527A0');
  s.addText('各店舗様に配布するシフトアプリ専用LINEの機能・設計を検討します',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  // スマホ：シフトアプリLINE
  const pw=3.10;
  const {sx,sy,sw,sh}=addPhone(s,0.28,1.36,pw);
  addLineHeader(s,sx,sy,sw,'○○店舗 シフト管理');
  s.addShape(pptx.ShapeType.rect,{x:sx,y:sy+0.36,w:sw,h:sh-sw*0.72-0.36,fill:{color:'EDE7F6'}});
  s.addText('📅 シフト管理LINE\nアプリへようこそ！',{x:sx+0.06,y:sy+0.50,w:sw-0.12,h:0.90,fontSize:13,color:C_PURPLE,fontFace:'Meiryo UI',align:'center',valign:'middle',bold:true});
  addRichMenu(s,sx,sy+sh,sw,[
    {icon:'📲',label:'アプリを開く',bg:'EDE7F6',tc:'311B92'},
    {icon:'📖',label:'説明書',bg:'E8EAF6',tc:'311B92'},
    {icon:'❓',label:'サポート\n（検討中）',bg:'F5F5F5',tc:C_SUB},
    {icon:'📋',label:'シフト提出',bg:'EDE7F6',tc:'311B92'},
    {icon:'📣',label:'お知らせ\n（検討中）',bg:'F5F5F5',tc:C_SUB},
    {icon:'＋',label:'追加枠',bg:'F5F5F5',tc:C_SUB},
  ]);

  // 右：機能＋無料対策
  const tx=3.68,tw=9.40;
  s.addShape(pptx.ShapeType.rect,{x:tx,y:1.36,w:tw,h:0.50,fill:{color:'4527A0'}});
  s.addText('✅  現在決まっている機能',{x:tx+0.14,y:1.36,w:tw-0.18,h:0.50,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  let cy=1.96;
  cy=okRow(s,tx,cy,tw,'アプリボタン ― タップするとシフトアプリが起動する');
  cy=okRow(s,tx,cy,tw,'説明書ボタン ― アプリの使い方説明書ページへ遷移する');
  cy+=0.12;

  s.addShape(pptx.ShapeType.rect,{x:tx,y:cy,w:tw,h:0.50,fill:{color:C_AMBER}});
  s.addText('❓  追加検討が必要な機能（議論）',{x:tx+0.14,y:cy,w:tw-0.18,h:0.50,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  cy+=0.56;
  ['シフト提出期限のリマインド通知','店長（オーナー）様→スタッフ様へのお知らせ配信','FAQボタン・サポート窓口'].forEach(t=>{ cy=issueRow(s,tx,cy,tw,t); cy-=0.06; });
  cy+=0.16;

  s.addShape(pptx.ShapeType.rect,{x:tx,y:cy,w:tw,h:0.48,fill:{color:C_RED}});
  s.addText('💰  無料プラン（200通/月）内に収める対策',{x:tx+0.14,y:cy,w:tw-0.18,h:0.48,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  cy+=0.54;
  [
    '一斉配信を月2〜3回に絞り、200通枠を計画的に使う',
    'リッチメニューで自己解決を促し、トーク対応件数を削減する',
    '定型質問には自動返信（Webhook）を設定して人力対応を減らす',
  ].forEach(t=>{ cy=okRow(s,tx,cy,tw,t); cy-=0.06; });
}

// ==================== 議題6：LINE広告 ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'議題 6　公式LINEの宣伝 ― LINE広告の活用検討',C_LINE);
  s.addText('LINE広告を活用して友だち数を増やす仕組みを検討します',{x:0.3,y:0.90,w:12.7,h:0.40,fontSize:18,color:C_SUB,fontFace:'Meiryo UI'});

  // LINEアプリ上の広告イメージ（スマホ）
  const {sx,sy,sw,sh}=addPhone(s,0.28,1.36,2.90);
  // トークリスト風
  s.addShape(pptx.ShapeType.rect,{x:sx,y:sy,w:sw,h:sh,fill:{color:'F5F5F5'}});
  s.addShape(pptx.ShapeType.rect,{x:sx,y:sy,w:sw,h:0.36,fill:{color:C_LINE}});
  s.addText('トーク',{x:sx,y:sy,w:sw,h:0.36,fontSize:15,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
  // トークアイテム
  [[C_LIGHT,'友人A','こんにちは'],[C_LIGHTB,'友人B','了解です'],['FFF8E1','🎯 広告','OZONOIX公式LINE\n友だち追加はこちら！']].forEach(([bg,name,msg],i)=>{
    s.addShape(pptx.ShapeType.rect,{x:sx,y:sy+0.42+i*0.90,w:sw,h:0.82,fill:{color:bg},line:{color:'EEEEEE',width:0.3}});
    s.addShape(pptx.ShapeType.ellipse,{x:sx+0.06,y:sy+0.50+i*0.90,w:0.44,h:0.44,fill:{color:i===2?C_AMBER:'BBBBBB'}});
    s.addText(name,{x:sx+0.56,y:sy+0.50+i*0.90,w:sw-0.64,h:0.22,fontSize:12,bold:true,color:C_TEXT,fontFace:'Meiryo UI'});
    s.addText(msg,{x:sx+0.56,y:sy+0.70+i*0.90,w:sw-0.64,h:0.36,fontSize:11,color:C_SUB,fontFace:'Meiryo UI'});
    if(i===2){
      s.addShape(pptx.ShapeType.rect,{x:sx+sw-0.56,y:sy+0.50+i*0.90,w:0.50,h:0.22,fill:{color:C_LINE}});
      s.addText('広告',{x:sx+sw-0.56,y:sy+0.50+i*0.90,w:0.50,h:0.22,fontSize:10,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    }
  });
  s.addText('⬆️ LINE内に自動掲載',{x:0.28,y:sy+sh+0.10,w:2.90,h:0.30,fontSize:13,color:C_LINE,fontFace:'Meiryo UI',align:'center',bold:true});

  // 右：説明
  const tx=3.50,tw=9.60;
  s.addShape(pptx.ShapeType.rect,{x:tx,y:1.36,w:tw,h:0.50,fill:{color:C_LINE}});
  s.addText('📣  LINE広告の仕組み（成果報酬型）',{x:tx+0.14,y:1.36,w:tw-0.18,h:0.50,fontSize:19,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});

  // 3ポイント横並び
  [
    {icon:'🎯',t:'成果報酬型',b:'友だち追加された時だけ課金。無駄な広告費が出にくい'},
    {icon:'📱',t:'LINE内自動掲載',b:'タイムライン・トークなど普段使う場所に自動表示'},
    {icon:'💸',t:'コストが比較的安い',b:'調査した限り費用対効果が高く、積極活用を検討したい'},
  ].forEach((p,i)=>{
    s.addShape(pptx.ShapeType.rect,{x:tx+i*3.22,y:1.96,w:3.06,h:2.06,fill:{color:C_LIGHT},line:{color:C_LINE,width:1.5}});
    s.addText(p.icon,{x:tx+i*3.22,y:2.02,w:3.06,h:0.58,fontSize:26,fontFace:'Meiryo UI',align:'center'});
    s.addText(p.t,{x:tx+i*3.22+0.10,y:2.60,w:2.86,h:0.40,fontSize:17,bold:true,color:'1B5E20',fontFace:'Meiryo UI',align:'center'});
    s.addText(p.b,{x:tx+i*3.22+0.10,y:3.00,w:2.86,h:0.90,fontSize:15,color:C_TEXT,fontFace:'Meiryo UI',valign:'top'});
  });

  s.addShape(pptx.ShapeType.rect,{x:tx,y:4.18,w:tw,h:0.46,fill:{color:C_AMBER}});
  s.addText('⚠️  活用の前提条件・左右される要因',{x:tx+0.14,y:4.18,w:tw-0.18,h:0.46,fontSize:18,bold:true,color:C_WHITE,fontFace:'Meiryo UI',valign:'middle'});
  let cy=4.74;
  [
    '公式LINEの月額プランによってメッセージ上限が変わるため、友だちが増えた場合のコスト増加を事前試算する必要がある',
    'IT導入補助金・小規模事業者持続化補助金など、広告費に使える補助金があれば積極活用したい',
  ].forEach(t=>{ cy=issueRow(s,tx,cy,tw,t); });
}

// ==================== 全体まとめ ====================
{
  const s=pptx.addSlide();
  s.background={color:C_BG};
  addHeader(s,'全体まとめ ― 今後のアクションと優先度',C_DARK);
  const acts=[
    {pri:'高',label:'LINE導線の方向性を決定する（A or B）',detail:'本会議で方向性A（LINE直接）か方向性B（フォーム経由）かを決定する',color:C_RED},
    {pri:'高',label:'テンプレートLINEの事前大量生産を開始する',detail:'提供スピード改善のための初期工数を確保し、着手する',color:C_RED},
    {pri:'中',label:'OZONOIX公式LINEのリッチメニューを設計・実装する',detail:'お問い合わせ・商品紹介・Q&A等のメニュー構成を確定させる',color:C_AMBER},
    {pri:'中',label:'HP側の登録済みユーザー向け表示を実装する',detail:'LINE経由URLにパラメータを付与し、適切な表示切替を開発チームと協議',color:C_AMBER},
    {pri:'中',label:'店舗LINEの追加機能・無料プラン対策を確定する',detail:'リマインド通知・自動返信など追加機能の優先順位を決める',color:C_AMBER},
    {pri:'低',label:'LINE広告の費用試算と補助金の調査を行う',detail:'運用コストが確定したタイミングで広告出稿の準備を始める',color:C_BLUE},
  ];
  acts.forEach((a,i)=>{
    const ay=0.92+i*1.04;
    s.addShape(pptx.ShapeType.rect,{x:0.28,y:ay,w:12.77,h:0.90,fill:{color:C_WHITE},line:{color:a.color,width:1.5}});
    s.addShape(pptx.ShapeType.rect,{x:0.28,y:ay,w:1.10,h:0.90,fill:{color:a.color}});
    s.addText('優先\n'+a.pri,{x:0.28,y:ay,w:1.10,h:0.90,fontSize:15,bold:true,color:C_WHITE,fontFace:'Meiryo UI',align:'center',valign:'middle'});
    s.addText(a.label,{x:1.50,y:ay+0.05,w:11.40,h:0.42,fontSize:19,bold:true,color:C_TEXT,fontFace:'Meiryo UI',valign:'middle'});
    s.addText(a.detail,{x:1.50,y:ay+0.50,w:11.40,h:0.34,fontSize:15,color:C_SUB,fontFace:'Meiryo UI'});
  });
}

// ==================== 保存 ====================
pptx.writeFile({fileName:OUT})
  .then(()=>console.log('✅ 会議資料作成完了:\n'+OUT))
  .catch(e=>console.error('❌ エラー:',e));
