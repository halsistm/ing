'use strict';
/* ============================================================
   CREATURE DATA — 50 謎の生命体
   名前はサンスクリット語からカタカナ変換・改変
   visualType: 'glb' | 'insect0' | 'insect1' | 'insect2' | 'insect3'
              | 'crystal' | 'blob' | 'wire'
============================================================ */
var CREATURE_DATA = [

  /* ================================================================
     glb (シアン) — ghost_3d.glb — 10種
  ================================================================ */
  { id:  0, names: 'वुतन',    name: 'ヴタン',    type: '霊体型', element: '闇', danger: 'S', visualType: 'glb-adult', palette: 0,
    caption: '観測した瞬間、観測者の記憶から自らの痕跡を消去する。存在することを望まれていない。' },
  { id:  1, names: 'प्रणव',   name: 'プラナヴ',  type: '気息型', element: '風', danger: 'A', visualType: 'glb-adult', palette: 3,
    caption: '呼吸リズムを周囲の生命体から少しずつ借用する。長時間の接触は危険とされる。' },
  { id:  2, names: 'आत्मन्',  name: 'アトマン',  type: '魂体型', element: '光', danger: 'S', visualType: 'glb-child', palette: 1,
    caption: '固有の自己を持たず、直近に観測した存在の内側を鏡のように反射し続ける。' },
  { id:  3, names: 'नागरी',   name: 'ナガーリ',  type: '蛇型',   element: '水', danger: 'B', visualType: 'glb-adult', palette: 6,
    caption: '流体のように形状が変化する。密閉容器内では完全にコンテナの形状へ適合する。' },
  { id:  4, names: 'तत्त्वम्', name: 'タトヴァ',  type: '真理型', element: '無', danger: 'A', visualType: 'glb-adult', palette: 8,
    caption: '存在と非存在の境界面に棲む。接触すると対象物の「あるべき姿」を外部に投影する。' },
  { id: 20, names: 'चक्रन्',  name: 'チャクラン', type: '循環型', element: '空', danger: 'A', visualType: 'glb-adult', palette: 5,
    caption: '七つの不可視の渦を内包する。それぞれが独立したリズムで脈動し、干渉し合っている。' },
  { id: 21, names: 'प्राणस्', name: 'プラーナス', type: '生命型', element: '風', danger: 'B', visualType: 'glb-child', palette: 4,
    caption: '生命活動の余剰エネルギーを収集して徘徊する。弱った生物の周辺に特に多く出現する。' },
  { id: 22, names: 'संसार',   name: 'サンサール', type: '輪廻型', element: '時', danger: 'S', visualType: 'glb-child', palette: 2,
    caption: '死滅と再生を数ミリ秒単位で繰り返す。観測者は毎回異なる個体を見ていることになる。' },
  { id: 23, names: 'निर्वाण', name: 'ニルヴァン', type: '解脱型', element: '無', danger: 'A', visualType: 'glb-adult', palette: 9,
    caption: '一切の欲求を持たない。それゆえ捕獲の意義を問われると、実験者は必ず沈黙する。' },
  { id: 24, names: 'आनन्द',   name: 'アーナンダ', type: '歓喜型', element: '光', danger: 'C', visualType: 'glb-child', palette: 7,
    caption: '接触した物体から微弱な幸福感を放出させる。長期接触による依存性の報告が複数ある。' },

  /* ================================================================
     glb2 (マゼンタ) — ghost_3d2.glb — 9種
  ================================================================ */
  { id:  5, names: 'अग्निः',   name: 'アグニス',   type: '炎型',   element: '炎', danger: 'A', visualType: 'glb2-adult', palette: 10,
    caption: '中心核の温度は計測不能。周囲の可燃物を侵食しないが、常に白熱している。' },
  { id:  6, names: 'वायुम्',   name: 'ヴァイユン',  type: '風型',   element: '風', danger: 'C', visualType: 'glb2-child', palette: 14,
    caption: 'リング軌道を高速で周回する粒子群から構成される。静止状態は理論上存在しない。' },
  { id:  7, names: 'क्रिश्चियन', name: 'クリシャント', type: '暗黒型', element: '闇', danger: 'S', visualType: 'glb2-adult', palette: 12,
    caption: '可視光をほぼ完全に吸収する。移動経路に局所的な暗点を形成しながら進む。' },
  { id:  8, names: 'इन्द्रः',  name: 'インドラス',  type: '雷電型', element: '空', danger: 'A', visualType: 'glb2-adult', palette: 17,
    caption: '内蔵する粒子が高度に帯電している。近接すると電子機器に重篤な誤作動が生じる。' },
  { id: 25, names: 'वरुणस्',   name: 'ヴァルナス',  type: '水天型', element: '水', danger: 'A', visualType: 'glb2-adult', palette: 11,
    caption: '降雨の直前に出現率が上昇する。捕獲後、翌日必ず雨が降ったという記録が複数残る。' },
  { id: 26, names: 'मित्रसुन्', name: 'ミトラスン',  type: '契約型', element: '光', danger: 'B', visualType: 'glb2-child', palette: 15,
    caption: '一度目視した相手を「認識済み」として記録する。再会時には反応パターンが変化する。' },
  { id: 27, names: 'रुद्राण',  name: 'ルドラーン',  type: '嵐型',   element: '風', danger: 'S', visualType: 'glb2-adult', palette: 13,
    caption: '半径3メートル以内の気流を乱す。その乱流パターンは毎回まったく同一であることが判明した。' },
  { id: 28, names: 'अश्विन्',  name: 'アシュヴィン', type: '双星型', element: '空', danger: 'B', visualType: 'glb2-child', palette: 18,
    caption: '必ず二体一組で行動する。片方が捕獲されると、もう片方は三秒後に消失する。' },
  { id: 29, names: 'गन्धर्व',  name: 'ガンダルヴァ', type: '音霊型', element: '風', danger: 'A', visualType: 'glb2-adult', palette: 16,
    caption: '移動時に可聴域外の音波を発する。近傍の動植物に影響が出るが、発生源の特定が困難。' },

  /* ================================================================
     glb3 (ライムグリーン) — ghost_3d3.glb — 8種
  ================================================================ */
  { id: 30, names: 'अप्सरान्', name: 'アプサラーン', type: '水精型', element: '水', danger: 'C', visualType: 'glb3-child', palette: 21,
    caption: '鏡面または水面の反射像として先に目撃される。実体の確認は反射の発見から遅れる。' },
  { id:  9, names: 'जालण्डा', name: 'ジャランダ',   type: '水型',   element: '水', danger: 'B', visualType: 'glb3-adult', palette: 24,
    caption: '半透明の外殻内部に不明な何かが浮遊している。それは常に観測者の死角に位置する。' },
  { id: 10, names: 'पृथ्वी',  name: 'プリトヴィ',   type: '土型',   element: '土', danger: 'B', visualType: 'glb3-adult', palette: 22,
    caption: '脊椎状構造に沿って鉱物結晶が成長する。移動経路に微量の希少鉱物を析出する。' },
  { id: 11, names: 'कर्षण',   name: 'カーシャン',   type: '空間型', element: '空', danger: 'S', visualType: 'glb3-adult', palette: 23,
    caption: '位置情報が量子的に不安定。複数の座標に同時存在する可能性が実験的に示唆されている。' },
  { id: 12, names: 'सोमन',    name: 'ソーマン',     type: '月光型', element: '光', danger: 'C', visualType: 'glb3-child', palette: 26,
    caption: '月齢と連動して活動量が変化する。新月には完全に静止することが繰り返し観測されている。' },
  { id: 31, names: 'रक्षाण',  name: 'ラクシャーン',  type: '守護型', element: '光', danger: 'B', visualType: 'glb3-adult', palette: 20,
    caption: '他の生命体の危険を察知して周囲に展開する。ただし保護対象の選定基準は不明。' },
  { id: 32, names: 'गणेशन्',  name: 'ガネーシャン',  type: '障害型', element: '土', danger: 'A', visualType: 'glb3-adult', palette: 19,
    caption: '進路上に不可視の障壁を生成する。壁の消滅条件は現在も特定できていない。' },
  { id: 33, names: 'कालिण',   name: 'カーリャン',   type: '暗黒型', element: '闇', danger: 'S', visualType: 'glb3-child', palette: 25,
    caption: '接触した光源の出力を永続的に低下させる。蓄積により室内全体が暗化する事例がある。' },

  /* ================================================================
     glb4 (オレンジ) — ghost_3d4.glb — 8種
  ================================================================ */
  { id: 13, names: 'कार्लन्', name: 'カーラン',    type: '時間型', element: '時', danger: 'S', visualType: 'glb4-adult', palette: 29,
    caption: '接触した物体の時間軸を局所的に歪める。捕獲記録の日時は常に矛盾を示す。' },
  { id: 14, names: 'मायन',    name: 'マーヤン',    type: '幻影型', element: '幻', danger: 'A', visualType: 'glb4-child', palette: 32,
    caption: '視認できる形状はすべて偽装である。真の外観についての解析は現在も未完了。' },
  { id: 15, names: 'ब्रावन्ट्', name: 'ブラヴァン', type: '無限型', element: '無', danger: 'S', visualType: 'glb4-adult', palette: 27,
    caption: '個体数の上限が存在しない。観測するたびに確認される総個体数が増加している。' },
  { id: 16, names: 'दरवाण',   name: 'ダルヴァン',  type: '秩序型', element: '土', danger: 'C', visualType: 'glb4-adult', palette: 30,
    caption: '移動軌跡が完璧な幾何学パターンに従う。いかなる行動にもランダム性が観測されない。' },
  { id: 34, names: 'वज्रन्',  name: 'ヴァジュラン', type: '金剛型', element: '炎', danger: 'A', visualType: 'glb4-adult', palette: 33,
    caption: 'リング構造の硬度は既知の物質を超える。しかし何故か本人は攻撃行動をとらない。' },
  { id: 35, names: 'सरस्वन्', name: 'サラスヴァン', type: '知識型', element: '光', danger: 'B', visualType: 'glb4-adult', palette: 34,
    caption: '周囲の音声・光信号を記録し続ける。捕獲後の解析から、言語的なパターンが検出された。' },
  { id: 36, names: 'स्फटन्',  name: 'スパタック',  type: '水晶型', element: '光', danger: 'B', visualType: 'glb4-child', palette: 31,
    caption: '六方晶系の構造をもつ完全無欠の結晶体。光を当てると内部で見たことのない色が生成される。' },
  { id: 37, names: 'कृश्यन्', name: 'クリシャン',  type: '暗晶型', element: '闇', danger: 'A', visualType: 'glb4-adult', palette: 28,
    caption: '結晶面が光を反射せず、逆に周囲の光を引き込む。内部は別の空間につながっている説がある。' },

  /* ================================================================
     glb5 (バイオレット) — ghost_3d5.glb — 7種
  ================================================================ */
  { id: 17, names: 'विष्णा',  name: 'ヴィシュナ',  type: '浸透型', element: '光', danger: 'A', visualType: 'glb5-child', palette: 40,
    caption: '物質の分子間隙を自由に通過する。捕獲容器の素材選定には特別な注意が必要とされる。' },
  { id: 18, names: 'शिवन',    name: 'シヴァーン',  type: '変容型', element: '炎', danger: 'S', visualType: 'glb5-adult', palette: 36,
    caption: 'クラウン構造が高速で崩壊と再生を繰り返す。エネルギー収支が熱力学則に従わない。' },
  { id: 19, names: 'यमन',     name: 'ヤマーン',    type: '境界型', element: '時', danger: 'B', visualType: 'glb5-adult', palette: 35,
    caption: '生体の境界線付近に出没する。直接的な害はないが、接近時に周囲温度が2°C低下する。' },
  { id: 38, names: 'वज्रिन्', name: 'ヴァジュリン', type: '雷晶型', element: '空', danger: 'S', visualType: 'glb5-adult', palette: 41,
    caption: '結晶軸に沿って常時放電している。電荷は外部から供給されていないとみられる。' },
  { id: 39, names: 'मणिकन्',  name: 'マニーカン',  type: '宝石型', element: '炎', danger: 'C', visualType: 'glb5-child', palette: 37,
    caption: '表面温度が常に37.0°C。体温を持つ鉱物として分類するか、生命体として扱うか議論が続く。' },
  { id: 40, names: 'हिमावन्', name: 'ヒマーヴァン', type: '氷晶型', element: '水', danger: 'B', visualType: 'glb5-adult', palette: 38,
    caption: '−5°C以下でのみ安定する。常温環境では十秒ごとに形状を再構成し続ける。' },
  { id: 41, names: 'अमृतन्',  name: 'アムリタン',  type: '不死型', element: '光', danger: 'A', visualType: 'glb5-adult', palette: 39,
    caption: '分割しても分割後の各個体が独立して再生する。現在確認されている最小分割数は1024。' },

  /* ================================================================
     glb6 (レッド) — ghost_3d6.glb — 8種
  ================================================================ */
  { id: 42, names: 'सोमलिन्', name: 'ソーマリン',   type: '液体型', element: '水', danger: 'B', visualType: 'glb6-adult', palette: 49,
    caption: '固体・液体・気体の相転移を任意のタイミングで行う。ただし捕獲時は必ず液体状態をとる。' },
  { id: 43, names: 'रसायन',   name: 'ラサーヤン',   type: '液錬型', element: '幻', danger: 'A', visualType: 'glb6-adult', palette: 43,
    caption: '触れた素材を同じ体積の別素材に変換する。変換規則はランダムではなく、何らかの意図がある。' },
  { id: 44, names: 'मधुन्',   name: 'マドゥーン',   type: '蜜液型', element: '土', danger: 'C', visualType: 'glb6-child', palette: 46,
    caption: '表面から分泌される物質が強力な粘着性を持つ。他の生物体の痕跡が内部から検出されている。' },
  { id: 45, names: 'विषाणन्', name: 'ヴィサーナン',  type: '毒液型', element: '闇', danger: 'S', visualType: 'glb6-adult', palette: 44,
    caption: '接触した有機物を分解する。その速度は既知のいかなる酵素反応も超える。近接厳禁。' },
  { id: 46, names: 'नादन्',   name: 'ナーダーン',   type: '音振型', element: '風', danger: 'B', visualType: 'glb6-adult', palette: 42,
    caption: '骨格構造全体が弦楽器のように振動する。固有周波数は個体ごとに異なり、音は可聴域外。' },
  { id: 47, names: 'श्रुतिन्', name: 'シュルーティン', type: '聴覚型', element: '空', danger: 'A', visualType: 'glb6-adult', palette: 47,
    caption: '全宇宙の音を受信する受像機として機能する。近傍では過去の音声が再生されることがある。' },
  { id: 48, names: 'आकाशन्',  name: 'アーカーシャン', type: '虚空型', element: '無', danger: 'S', visualType: 'glb6-child', palette: 45,
    caption: '骨格の占める「体積」はゼロに限りなく近い。捕獲しても捕獲したことが証明できない。' },
  { id: 49, names: 'विओमन्',  name: 'ヴィオマーン',  type: '天空型', element: '空', danger: 'C', visualType: 'glb6-child', palette: 48,
    caption: '重力に無関係に浮遊する。骨格線の交点に蓄えられたエネルギーが反重力源とみられる。' },

  /* ================================================================
     glb7 (ゴールド) — ghost_3d7.glb — 10種
  ================================================================ */
  { id: 50, names: 'महाफेन',  name: 'マシュマロマン', type: '軟体巨型', element: '無', danger: 'S', visualType: 'glb7-adult', palette: 53,
    caption: 'メガルームにのみ出現する。体高は数十メートルに達する。接触した物質はすべて無害な白い泡に変換されるが、本人は常に笑顔である。笑顔が消えたという記録はない。' },
  { id: 51, names: 'क्लेद',   name: 'クレーダ',     type: '毒液型', element: '闇', danger: 'B', visualType: 'glb7-child', palette: 52,
    caption: '表面から常に毒性の高い緑色の分泌物を滲出させる。踏んだ痕跡だけが残り、本体は消える。' },
  { id: 52, names: 'हलाहल',   name: 'ハラーラ',     type: '猛毒型', element: '闇', danger: 'S', visualType: 'glb7-adult', palette: 50,
    caption: '神話上の猛毒と同一の組成を持つと分析されたが、報告書を書いた研究者は翌日退職した。' },
  { id: 53, names: 'आम्ल',    name: 'アームラ',     type: '酸化型', element: '闇', danger: 'A', visualType: 'glb7-adult', palette: 54,
    caption: '接触した金属を数秒で溶解する。しかし生体には一切の影響を与えない。理由は不明。' },
  { id: 54, names: 'जलन्',    name: 'ジャラン',     type: '深海型', element: '水', danger: 'B', visualType: 'glb7-adult', palette: 51,
    caption: '深海の暗圧をそのまま体内に封じ込めている。近くで息を止めると引き寄せられる感覚が生じる。' },
  { id: 55, names: 'तमसन्',   name: 'タマサン',     type: '深淵型', element: '闇', danger: 'A', visualType: 'glb7-adult', palette: 55,
    caption: '可視光をほぼ完全に吸収する。輪郭だけが淡く紫に発光する。内部は観測不可能。' },
  { id: 56, names: 'नीलन्',   name: 'ニーラン',     type: '生光型', element: '光', danger: 'C', visualType: 'glb7-child', palette: 56,
    caption: '深海発光生物と同じ機構で青緑色に輝く。暗闇で群れると海底のように見える。' },
  { id: 57, names: 'स्फुरन्', name: 'スフラン',     type: '閃光型', element: '光', danger: 'B', visualType: 'glb7-child', palette: 70,
    caption: '1秒間に数十回の発光パルスを放つ。長時間観察した者は色覚に異常を来したという報告がある。' },
  { id: 58, names: 'विद्युन्', name: 'ヴィドゥン',   type: '電光型', element: '空', danger: 'A', visualType: 'glb7-adult', palette: 68,
    caption: '体表を高電圧の電流が走っている。接触時の放電音を研究者たちはひそかに「歌」と呼ぶ。' },
  { id: 59, names: 'ज्वलन्',  name: 'ジュヴァラン',  type: '炎液型', element: '炎', danger: 'B', visualType: 'glb7-adult', palette: 69,
    caption: '燃えているが燃料がない。熱を放出するたびに逆に大きくなる。熱力学の例外とされている。' },

  /* ================================================================
     glb8 (ティール) — ghost_3d8.glb — 5種 ※子供サイズ (tiny/small)
  ================================================================ */
  { id: 60, names: 'बालन्',   name: 'バーラン',    type: '幼体型', element: '風', danger: 'C', visualType: 'glb8-child', palette: 57,
    caption: '生まれたての個体にのみ観測される形態。成体への変態条件は一切不明。' },
  { id: 61, names: 'क्षुद्रन्', name: 'クシュドラン', type: '微小型', element: '光', danger: 'C', visualType: 'glb8-child', palette: 60,
    caption: '指先に乗るほど小さいが、発する光量は成体と変わらない。比表面積の概念を覆す存在。' },
  { id: 62, names: 'नवजन्',   name: 'ナヴァジャン',  type: '新生型', element: '水', danger: 'D', visualType: 'glb8-child', palette: 58,
    caption: '誕生直後の個体は周囲の液体を吸収して急速に成長するが、観測中は成長が止まる。' },
  { id: 63, names: 'शिशुन्',  name: 'シーシュン',   type: '稚体型', element: '無', danger: 'D', visualType: 'glb8-child', palette: 59,
    caption: '成体の十分の一のサイズで発見される。群れると互いの重力で公転軌道を形成する。' },
  { id: 64, names: 'तरुण्',   name: 'タルーン',    type: '若年型', element: '空', danger: 'C', visualType: 'glb8-child', palette: 61,
    caption: '若い個体ほど透明度が高い。完全な透明状態を「成熟前」と定義する学説が現在有力。' },

  /* ================================================================
     glb9 (コーラル) — ghost_3d9.glb — 5種 ※大人サイズ (normal/large/giant)
  ================================================================ */
  { id: 65, names: 'महान्',   name: 'マハーン',    type: '成熟型', element: '炎', danger: 'A', visualType: 'glb9-adult', palette: 62,
    caption: '完全成熟した個体は体表温度が数百度に達する。しかし周囲を燃やした記録はない。' },
  { id: 66, names: 'वृद्धन्', name: 'ヴリッダン',  type: '老成型', element: '土', danger: 'B', visualType: 'glb9-adult', palette: 64,
    caption: '長寿個体は外殻に地層のような縞模様をもつ。その層の数が年齢に比例するという説がある。' },
  { id: 67, names: 'प्रौढन्', name: 'プラウダン',  type: '壮年型', element: '幻', danger: 'S', visualType: 'glb9-adult', palette: 67,
    caption: '最大個体は体高3メートルを超える。近づくと現実の輪郭がにじみ、遠近感が崩壊する。' },
  { id: 68, names: 'परिपक्व', name: 'パリパクヴァ', type: '完熟型', element: '光', danger: 'A', visualType: 'glb9-adult', palette: 63,
    caption: '成熟の証として体内に恒星核と同等の密度をもつ点が形成される。採取は不可能とされる。' },
  { id: 69, names: 'जरायुन्', name: 'ジャラーユン', type: '大成型', element: '闇', danger: 'S', visualType: 'glb9-adult', palette: 65,
    caption: '成体は影を二重に落とす。二つの影が異なる方向を向くとき、観測者は必ず体調を崩す。' }
];

/* ---- 属性カラーマップ ---- */
var ELEMENT_COLORS = {
  '炎': { bg: 'rgba(255,50,10,0.18)',  border: '#ff4422', text: '#ff8866' },
  '水': { bg: 'rgba(0,100,255,0.18)',  border: '#2288ff', text: '#66aaff' },
  '風': { bg: 'rgba(80,255,180,0.15)', border: '#44ddaa', text: '#88ffcc' },
  '土': { bg: 'rgba(160,110,40,0.20)', border: '#cc8844', text: '#ddaa66' },
  '空': { bg: 'rgba(140,50,255,0.18)', border: '#9944ff', text: '#cc88ff' },
  '光': { bg: 'rgba(255,240,100,0.18)',border: '#ddcc44', text: '#ffeeaa' },
  '闇': { bg: 'rgba(60,0,120,0.25)',   border: '#6600cc', text: '#aa66ff' },
  '時': { bg: 'rgba(0,220,220,0.15)',  border: '#00cccc', text: '#44ffff' },
  '幻': { bg: 'rgba(255,50,255,0.15)', border: '#cc44cc', text: '#ff88ff' },
  '無': { bg: 'rgba(100,100,100,0.18)',border: '#888888', text: '#cccccc' }
};

/* ---- 危険度カラーマップ ---- */
var DANGER_COLORS = {
  'S': '#ff0044',
  'A': '#ff8800',
  'B': '#ffcc00',
  'C': '#44cc44',
  'D': '#888888'
};

/* ---- カードミニアイコン描画 ---- */
function drawCreatureIcon(canvas, visualType, elementKey) {
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);

  var ec = ELEMENT_COLORS[elementKey] || ELEMENT_COLORS['無'];
  var col = ec.border;
  var fillCol = ec.bg;

  ctx.strokeStyle = col;
  ctx.lineWidth = 1.5;
}