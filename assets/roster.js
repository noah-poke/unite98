/* ============================================================
   roster.js — 使用可能ポケモン一覧（2026年8月時点 / 全98体）
   メガシンカ形態も1体として独立カウントしています。

   ▼ 新ポケモンが追加されたときの追記方法
     該当する型の list に  { n:'ポケモン名', id:'画像ファイル名' }  を1行足すだけです。
     id は images/ フォルダに置く画像のファイル名（拡張子なし）になります。
     例) { n:'ストリンダー', id:'toxtricity' }  →  images/toxtricity.png を読みます。

   ▼ 別名（ALIAS）
     その表記で入力しても正解にしたい書き方をここに足します。
   ============================================================ */

window.ROSTER = [
  {
    key: 'attack', name: 'アタック型', color: 'var(--attack)',
    list: [
      { n:'ピカチュウ',          id:'pikachu' },
      { n:'フシギバナ',          id:'venusaur' },
      { n:'ゲッコウガ',          id:'greninja' },
      { n:'アローラキュウコン',  id:'ninetales-alola' },
      { n:'アローラライチュウ',  id:'raichu-alola' },
      { n:'ウッウ',              id:'cramorant' },
      { n:'エースバーン',        id:'cinderace' },
      { n:'サーナイト',          id:'gardevoir' },
      { n:'ニンフィア',          id:'sylveon' },
      { n:'ジュナイパー',        id:'decidueye' },
      { n:'ジュラルドン',        id:'duraludon' },
      { n:'エーフィ',            id:'espeon' },
      { n:'マフォクシー',        id:'delphox' },
      { n:'グレイシア',          id:'glaceon' },
      { n:'ミュウ',              id:'mew' },
      { n:'ドラパルト',          id:'dragapult' },
      { n:'シャンデラ',          id:'chandelure' },
      { n:'ミュウツー(Y)',       id:'mewtwo-y' },
      { n:'インテレオン',        id:'inteleon' },
      { n:'ミライドン',          id:'miraidon' },
      { n:'サンダー',            id:'zapdos' },
      { n:'ラティオス',          id:'latios' },
      { n:'グレンアルマ',        id:'armarouge' },
      { n:'バクフーン',          id:'typhlosion' },
      { n:'ラウドボーン',        id:'skeledirge' },
      { n:'イベルタル',          id:'yveltal' },
      { n:'レシラム',            id:'reshiram' }
    ]
  },
  {
    key: 'balance', name: 'バランス型', color: 'var(--balance)',
    list: [
      { n:'リザードン',        id:'charizard' },
      { n:'メガリザードンX',   id:'charizard-mega-x' },
      { n:'メガリザードンY',   id:'charizard-mega-y' },
      { n:'ルカリオ',          id:'lucario' },
      { n:'メガルカリオ',      id:'lucario-mega' },
      { n:'ギャラドス',        id:'gyarados' },
      { n:'メガギャラドス',    id:'gyarados-mega' },
      { n:'カイリキー',        id:'machamp' },
      { n:'ガブリアス',        id:'garchomp' },
      { n:'アマージョ',        id:'tsareena' },
      { n:'カイリュー',        id:'dragonite' },
      { n:'ギルガルド',        id:'aegislash' },
      { n:'マリルリ',          id:'azumarill' },
      { n:'マッシブーン',      id:'buzzwole' },
      { n:'バンギラス',        id:'tyranitar' },
      { n:'ハッサム',          id:'scizor' },
      { n:'ウーラオス',        id:'urshifu' },
      { n:'ザシアン',          id:'zacian' },
      { n:'ミュウツー(X)',     id:'mewtwo-x' },
      { n:'バシャーモ',        id:'blaziken' },
      { n:'ミミッキュ',        id:'mimikyu' },
      { n:'エンペルト',        id:'empoleon' },
      { n:'タイレーツ',        id:'falinks' },
      { n:'ダダリン',          id:'dhelmise' },
      { n:'ソウブレイズ',      id:'ceruledge' },
      { n:'デカヌチャン',      id:'tinkaton' },
      { n:'ネギガナイト',      id:'sirfetchd' },
      { n:'パーモット',        id:'pawmot' },
      { n:'メタグロス',        id:'metagross' },
      { n:'スイクン',          id:'suicune' },
      { n:'ファイヤー',        id:'moltres' },
      { n:'オーダイル',        id:'feraligatr' },
      { n:'ウェーニバル',      id:'quaquaval' },
      { n:'パルキア',          id:'palkia' },
      { n:'ソルガレオ',        id:'solgaleo' }
    ]
  },
  {
    key: 'defense', name: 'ディフェンス型', color: 'var(--defense)',
    list: [
      { n:'カメックス',  id:'blastoise' },
      { n:'カビゴン',    id:'snorlax' },
      { n:'ヤドラン',    id:'slowbro' },
      { n:'マンムー',    id:'mamoswine' },
      { n:'イワパレス',  id:'crustle' },
      { n:'オーロット',  id:'trevenant' },
      { n:'ヨクバリス',  id:'greedent' },
      { n:'ヌメルゴン',  id:'goodra' },
      { n:'ブラッキー',  id:'umbreon' },
      { n:'シャワーズ',  id:'vaporeon' },
      { n:'ラプラス',    id:'lapras' },
      { n:'ホウオウ',    id:'ho-oh' },
      { n:'フリーザー',  id:'articuno' }
    ]
  },
  {
    key: 'speed', name: 'スピード型', color: 'var(--speed)',
    list: [
      { n:'ゲンガー',          id:'gengar' },
      { n:'ゾロアーク',        id:'zoroark' },
      { n:'アブソル',          id:'absol' },
      { n:'ドードリオ',        id:'dodrio' },
      { n:'ファイアロー',      id:'talonflame' },
      { n:'ゼラオラ',          id:'zeraora' },
      { n:'ダークライ',        id:'darkrai' },
      { n:'リーフィア',        id:'leafeon' },
      { n:'ガラルギャロップ',  id:'rapidash-galar' },
      { n:'マスカーニャ',      id:'meowscarada' },
      { n:'ニャース',          id:'meowth' }
    ]
  },
  {
    key: 'support', name: 'サポート型', color: 'var(--support)',
    list: [
      { n:'プクリン',    id:'wigglytuff' },
      { n:'ピクシー',    id:'clefable' },
      { n:'バリヤード',  id:'mr-mime' },
      { n:'ハピナス',    id:'blissey' },
      { n:'ヤミラミ',    id:'sableye' },
      { n:'ワタシラガ',  id:'eldegoss' },
      { n:'フーパ',      id:'hoopa' },
      { n:'キュワワー',  id:'comfey' },
      { n:'マホイップ',  id:'alcremie' },
      { n:'ラティアス',  id:'latias' },
      { n:'コダック',    id:'psyduck' },
      { n:'メガニウム',  id:'meganium' }
    ]
  }
];

/* この表記で入力しても正解にする */
window.ALIAS = {
  'メガリザードンX':   ['リザードンX', 'メガリザX'],
  'メガリザードンY':   ['リザードンY', 'メガリザY'],
  'メガギャラドス':    ['メガギャラ'],
  'メガルカリオ':      ['メガルカ'],
  'ミュウツー(X)':     ['ミュウツーX', 'メガミュウツーX'],
  'ミュウツー(Y)':     ['ミュウツーY', 'メガミュウツーY'],
  'アローラキュウコン':['キュウコン', 'アロキュウ'],
  'アローラライチュウ':['ライチュウ', 'アロライ'],
  'ガラルギャロップ':  ['ギャロップ'],
  'ウーラオス':        ['いちげきウーラオス', 'れんげきウーラオス', 'ダクマ'],
  'ホウオウ':          ['ホーオー'],
  'バリヤード':        ['バリアード'],
  'ハッサム':          ['ストライク']
};

/* 入力があいまいなときに聞き返す */
window.AMBIGUOUS = {
  'ミュウツー':     'もう少し正確に入力してください。',
  'メガリザードン': 'もう少し正確に入力してください。'
};
