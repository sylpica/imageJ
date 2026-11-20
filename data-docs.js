// ImageJ学習アプリ 第3ラウンド追加データ：ドキュメント（独自要約・解説）と強化用語集。
// 権利方針：ImageJ User Guide等の本文の翻訳・転載は行わない。本文はすべて一次情報を参照して新規に書き起こした独自要約・解説であり、各項目に出典（公式資料名・URL・対象バージョン）を明示する。
window.IJDATA2 = window.IJDATA2 || {};
window.IJDATA2.docs = [
 {
  "id": "D1",
  "title": "入門と画面構成",
  "intro": "この章では、ImageJとFijiの関係を説明します。操作の対象になる「アクティブ画像」の考え方や、取り消しの限界など、すべての操作の前提になる基礎を扱います。",
  "entries": [
   {
    "id": "D1-1",
    "title": "ImageJとFijiはどう違うか",
    "menu": "—（配布形態の違い）",
    "body": [
     "ImageJは、米国NIHが開発した画像処理・解析プログラムの本体です。パブリックドメインとして公開されています。Fijiは、そのImageJを土台にした配布形態です。ライフサイエンス分野でよく使うプラグイン群と、更新管理の仕組みが同梱されています。名前は「Fiji Is Just ImageJ」の略称です。",
     "そのため、基本操作やメニュー構成、測定の考え方は両者で共通しています。本リファレンスの説明は、原則として両方に当てはまります。ただし、プラグインの有無や更新方法など、配布形態に依存する部分は、その都度区別して記します。"
    ],
    "points": [
     "ImageJは本体、Fijiは本体＋プラグイン同梱の配布形態です",
     "基本操作と測定原理は共通です",
     "プラグイン構成と更新方法は、Fiji固有の話題になりやすいです"
    ],
    "caution": "画面やメニューの細部は、バージョンによって異なります。手元の環境と違う場合は、その違い自体を記録しておくと、再現性の確保に役立ちます。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r（2012）時点の記述を含む。配布形態の関係は現行版でも変わらない。",
    "lessons": [
     "L01"
    ],
    "terms": [
     "Fiji",
     "アクティブ画像",
     "プラグイン"
    ]
   },
   {
    "id": "D1-2",
    "title": "アクティブ画像：すべての操作は最前面の1枚に対して行われる",
    "menu": "—（ウィンドウのフォーカス）",
    "body": [
     "ImageJでは、タイトルバーがアクティブになっている最前面の画像ウィンドウが、すべての操作の対象になります。処理も計測も保存も、そのウィンドウに対して行われます。複数の画像を開いているときは、意図しない画像が対象になる事故が起きがちです。これは解析ミスの典型的な原因のひとつです。",
     "マクロでは、getTitle() でアクティブ画像のタイトルを取得できます。処理対象を明示的に確認したり、切り替えたりする記述も可能です。手作業の場合も、処理の直前にタイトルバーを確認する習慣が大切です。"
    ],
    "points": [
     "操作の対象は、常にアクティブな1ウィンドウです",
     "処理の前にタイトルを確認します",
     "マクロでは getTitle() や selectWindow で対象を明示できます"
    ],
    "caution": "非アクティブな画像を見ながら操作すると、別の画像を加工してしまいます。元画像は複製してから処理するのが安全です。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行1.54系でもこの原則は変わらない。",
    "lessons": [
     "L01",
     "L14"
    ],
    "terms": [
     "アクティブ画像"
    ]
   },
   {
    "id": "D1-3",
    "title": "Undo（取り消し）は直近の1操作だけが対象",
    "menu": "Edit > Undo",
    "body": [
     "ImageJの Undo で取り消せるのは、基本的に直近の画像編集・フィルタ操作だけです。それより前の操作へさかのぼって取り消すことはできません。一般的なアプリケーションのような、多段階の履歴 undo ではありません。",
     "そのため、破壊的な処理（画素値を書き換える処理）の前には、安全策が必要です。画像を複製しておくか、ROIや測定条件などの中間成果を保存しておきましょう。"
    ],
    "points": [
     "取り消せるのは直近の操作のみです",
     "破壊的な処理の前に、画像を複製します",
     "ROIや設定は、別途保存しておきます"
    ],
    "caution": "フィルタ適用や型変換のあとで保存して閉じると、元データには戻れません。元ファイルは上書きしない運用が原則です。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行版でも多段階 undo には対応していない。",
    "lessons": [
     "L01"
    ],
    "terms": [
     "Undo",
     "ROI"
    ]
   },
   {
    "id": "D1-4",
    "title": "コマンドレコーダ：GUI操作をマクロとして記録し、操作の意味を調べる",
    "menu": "Plugins > Macros > Record...",
    "body": [
     "コマンドレコーダは、GUIで行った操作を記録する機能です。操作は、run() 呼び出しを中心とするマクロコードとして生成されます。繰り返し処理を自動化する第一歩になります。同時に、「このメニュー操作が内部でどのコマンドに対応するか」を知るための、公式な調べ方でもあります。",
     "記録されたコードは、そのまま使うだけではありません。対象画像の指定やパラメータを書き換えて使うこともできます。そうすれば、手作業の手順を再現可能な形で残せます。"
    ],
    "points": [
     "操作は run() 呼び出しとして記録されます",
     "自動化の起点であり、コマンド名の確認手段でもあります",
     "パラメータ文字列を編集すれば、条件を固定できます"
    ],
    "caution": "記録には、そのときアクティブだった画像への操作も含まれます。別の画像へ適用するときは、対象の指定を確認してください。",
    "src": "https://imagej.net/ij/docs/menus/plugins.html",
    "srcName": "ImageJ公式「Plugins Menu」解説",
    "version": "現行の imagej.net 掲載解説に基づく。レコーダの基本仕様は1.46r時代から継続している。",
    "lessons": [
     "L14"
    ],
    "terms": [
     "コマンドレコーダ",
     ".ijm / マクロファイル"
    ]
   }
  ]
 },
 {
  "id": "D2",
  "title": "画像の種類とビット深度",
  "intro": "ビット深度は、「1ピクセルがどれだけの情報を保持できるか」を決めます。この章では、測定値の意味を整理します。変換で失われる情報や、RGBとグレースケールの違いも扱います。",
  "entries": [
   {
    "id": "D2-1",
    "title": "8-bit / 16-bit / 32-bit float：保持できる値の範囲と性質",
    "menu": "Image > Type",
    "body": [
     "8-bit画像は、1ピクセルあたり256階調（0〜255の整数）を保持します。16-bit画像は65,536階調（0〜65,535の整数）を保持します。整数型では、小数や負の値は表現できません。",
     "32-bit画像は、浮動小数点数で値を保持します。値の範囲に事実上の制限はありません。負の値や計算途中の小数、NaN（非数）も入り得ます。演算結果を切り捨てずに保持したい場合は、32-bitが適しています。",
     "ビット深度が大きいほど、階調は細かくなります。しかし、元の取得データに存在しない情報が増えるわけではありません。変換は表現形式の変更です。情報の追加ではありません。"
    ],
    "points": [
     "8-bitは256階調、16-bitは65,536階調で、いずれも整数です",
     "32-bit floatは、小数・負値・NaNを保持できます",
     "深度を上げても、失われた階調は復元しません"
    ],
    "caution": "表示上の見た目は、LUTや表示範囲で調整されます。そのため、深度の違いが見た目に直結するとは限りません。数値で確認してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行1.54系でも各型の仕様は同一である。",
    "lessons": [
     "L02"
    ],
    "terms": [
     "8-bit画像",
     "16-bit画像",
     "32-bit画像",
     "グレー値"
    ]
   },
   {
    "id": "D2-2",
    "title": "RGB画像の測定値は何を表すか",
    "menu": "Image > Type / Analyze > Measure",
    "body": [
     "RGB画像は、赤・緑・青の3チャンネルが各256値を持つ24-bitカラー画像です（アルファ付きは32-bitです）。RGB画像に対してそのまま測定すると、注意が要ります。チャンネルごとの値ではなく、輝度として合成された値が扱われる場面があるためです。",
     "チャンネルごとに定量したい場合は、先に分けてから測定するのが確実です。Image > Color > Split Channels で、各チャンネルをグレースケール画像に分けます。ヒストグラム表示でも、RGB画像は輝度へ変換した分布として表示されます。"
    ],
    "points": [
     "RGBは、3チャンネル×256値のカラー表現です",
     "定量は、チャンネル分離後のグレースケールで行うのが確実です",
     "RGBのヒストグラムは、輝度変換後の分布です"
    ],
    "caution": "カラー写真の見た目の明るさと、測定される輝度は、必ずしも一致しません。輝度には、人間の視感度に基づく重み付けが含まれる場合があるためです。蛍光画像の定量に、RGB化した画像を使ってはいけません。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行版でもチャンネル分離して測定する原則は同じである。",
    "lessons": [
     "L02",
     "L21"
    ],
    "terms": [
     "RGB画像",
     "チャンネル",
     "ヒストグラム"
    ]
   },
   {
    "id": "D2-3",
    "title": "ビット深度を下げると何が失われるか",
    "menu": "Image > Type",
    "body": [
     "16-bitから8-bitへ変換すると、65,536階調が256階調へ圧縮（量子化）されます。中間の階調情報は失われます。暗部のわずかな強度差や、飽和寸前の明部の差などは、同一値に潰れてしまいます。後から16-bitへ戻しても復元しません。",
     "変換時のスケーリング方法によっては、値の対応関係自体が変わります。解析に使う画像は、取得した元のビット深度のまま保持してください。表示用・提出用に変換したコピーとは、区別することが重要です。",
     "逆に、8-bitから16-bitや32-bitへ上げても、情報は増えません。ただし、以降の演算で小数を保持したい場合は、32-bit化に意味があります。"
    ],
    "points": [
     "深度を下げると階調が潰れ、元には戻りません",
     "変換時のスケーリングで、値の対応が変わることがあります",
     "解析用は元の深度で保持し、変換はコピーで行います"
    ],
    "caution": "「見た目が変わらない」ことと「数値が保たれる」ことは別です。定量解析の前に安易に8-bit化するのは避けてください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。量子化による情報損失の原理は現行版でも同一である。",
    "lessons": [
     "L02"
    ],
    "terms": [
     "16-bit画像",
     "8-bit画像",
     "量子化",
     "ダイナミックレンジ"
    ]
   },
   {
    "id": "D2-4",
    "title": "型変換（Type変換）で起きる値の変化",
    "menu": "Image > Type",
    "body": [
     "Image > Type の変換では、対象の型に合わせて、値が再解釈・丸め・スケーリングされます。整数型への変換では、小数が切り捨てられます。範囲外の値は、上限や下限に張り付きます。8-bitの Math 系処理でも同様です。255を超える結果は255に、0未満は0に丸められます。",
     "浮動小数を含む演算を正確に行いたい場合は、先に32-bitへ変換してから処理するのが原則です。Image Calculator の「32-bit Result」指定も、この考え方に基づきます。"
    ],
    "points": [
     "整数化では、小数の切り捨てと範囲外の飽和が起きます",
     "正確な演算は、32-bit化してから行います",
     "変換は複製画像で試し、値の変化を確認します"
    ],
    "caution": "変換ダイアログのスケーリング設定は、結果を大きく左右します。設定を記録せずに変換すると、再現性が失われます。",
    "src": "https://imagejdocu.list.lu/gui/process/math",
    "srcName": "ImageJ Documentation Wiki「Math」",
    "version": "imagejdocu の現行記載に基づく。丸めの仕様は User Guide 1.46r 時代から継続している。",
    "lessons": [
     "L02",
     "L13"
    ],
    "terms": [
     "32-bit画像",
     "Math（Process > Math）",
     "飽和"
    ]
   },
   {
    "id": "D2-5",
    "title": "グレー値（画素値）と実測値の関係",
    "menu": "Analyze > Measure（値の解釈）",
    "body": [
     "グレー値（画素値）は、検出器が記録した信号を数値化したものです。それ自体は物理量ではありません。露光、ゲイン、光源強度などの取得条件が変われば、同じ対象でもグレー値は変わります。蛍光強度や透過光の吸収を測る場合も同じです。",
     "そのため、グレー値の比較は、取得条件をそろえた画像同士でのみ意味を持ちます。背景差し引きや校正は、この相対比較を成立させるための手続きです。絶対量への変換とは別問題です。"
    ],
    "points": [
     "グレー値は、信号の相対的な大きさを表す数値です",
     "比較は、取得条件をそろえた画像間でのみ有効です",
     "物理量への変換には、別途の校正が必要です"
    ],
    "caution": "異なるセッションや異なる装置で得たグレー値を、そのまま絶対比較してはいけません。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述を含む一般原理。現行版でも解釈は同一である。",
    "lessons": [
     "L02",
     "L18"
    ],
    "terms": [
     "グレー値",
     "Mean Gray Value",
     "SNR"
    ]
   }
  ]
 },
 {
  "id": "D3",
  "title": "表示・LUT・色とチャンネル",
  "intro": "表示の変更と画素値の変更は、別物です。この章では、LUT、表示範囲、チャンネルとコンポジット画像の仕組みを区別して説明します。",
  "entries": [
   {
    "id": "D3-1",
    "title": "LUT（ルックアップテーブル）と疑似カラー",
    "menu": "Image > Lookup Tables",
    "body": [
     "LUTは、グレー値と表示色（赤・緑・青の各成分）の対応表です。グレースケール画像にLUTを割り当てると、疑似カラー画像になります。強度の違いが、色の違いとして表示されるためです。色は表示のための符号化にすぎません。画素値そのものは、単一チャンネルのままです。",
     "LUTの変更は表示だけを変えます。測定値には影響しません。逆に、疑似カラー表示をRGB画像として保存・変換すると、問題が起きます。チャンネル分離した定量ができなくなるためです。"
    ],
    "points": [
     "LUTは、グレー値から表示色への対応表です",
     "LUTの変更は表示だけで、画素値は変わりません",
     "定量は、疑似カラー化する前のデータで行います"
    ],
    "caution": "カラフルな表示は、強度分布の可視化には有効です。しかし、色の印象だけで強度を判断してはいけません。必ず数値とヒストグラムで確認してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行1.54系でもLUTの仕組みは同一である。",
    "lessons": [
     "L12"
    ],
    "terms": [
     "LUT（ルックアップテーブル）",
     "疑似カラー画像"
    ]
   },
   {
    "id": "D3-2",
    "title": "Brightness/Contrast は表示範囲の調整であって画素値の変更ではない",
    "menu": "Image > Adjust > Brightness/Contrast...",
    "body": [
     "Brightness/Contrast は、表示範囲を調整する道具です。ヒストグラムを見ながら、どのグレー値範囲を画面の黒〜白に対応づけるかを決めます。標準的な使い方では、画素値そのものは書き換わりません。見た目だけが変わります。",
     "ただし、Apply を押すなど、表示範囲を画素値へ反映させる操作をすると話が変わります。その時点で値が書き換わり、範囲外の情報は失われます。表示の最適化と、値の変更は、明確に区別してください。",
     "ヒストグラムに表示される Count / Mean / Mode / Min / Max は、選択範囲内の画素値の統計です。表示範囲を変更しても、これらの値は変わりません。"
    ],
    "points": [
     "表示範囲の調整では、画素値は変わりません",
     "Applyなどの反映操作では、値が書き換わります",
     "統計量は、表示ではなく実データから計算されます"
    ],
    "caution": "「見やすくした」つもりで Apply して保存すると、元データの階調が失われます。解析用データでは、反映操作を避けてください。",
    "src": "https://imagejdocu.list.lu/gui/analyze/histogramme",
    "srcName": "ImageJ Documentation Wiki「Histogram」",
    "version": "imagejdocu の現行記載に基づく。表示と値の区別は User Guide 1.46r 時代から一貫している。",
    "lessons": [
     "L12"
    ],
    "terms": [
     "Brightness/Contrast",
     "ヒストグラム",
     "LUT（ルックアップテーブル）"
    ]
   },
   {
    "id": "D3-3",
    "title": "チャンネルとコンポジット画像",
    "menu": "Image > Color > Merge Channels...",
    "body": [
     "コンポジット画像は、複数のチャンネルを分離したまま保持する画像形式です。各チャンネルは、8/16/32-bitのいずれでもかまいません。3チャンネルを超える構成も可能です。チャンネルごとに、表示のオン/オフやLUTを切り替えられます。",
     "これに対して通常のRGB画像は、表示のためにチャンネルが1枚に固定された表現です。蛍光の多重染色のように、チャンネルごとの定量が必要なデータは、コンポジットとして扱ってください。RGB化は、表示・提出用に限るべきです。"
    ],
    "points": [
     "コンポジットは、チャンネルを分離したまま保持します",
     "各チャンネルは、独立したビット深度を持てます",
     "定量は、コンポジットの各チャンネルで行います"
    ],
    "caution": "コンポジットをRGBへ変換すると、チャンネル情報が混ざってしまいます。分離した測定はできなくなります。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行版でもコンポジットの仕様は同一である。",
    "lessons": [
     "L04",
     "L21"
    ],
    "terms": [
     "コンポジット画像",
     "チャンネル",
     "ハイパースタック"
    ]
   },
   {
    "id": "D3-4",
    "title": "Split Channels と Merge Channels の使い分け",
    "menu": "Image > Color > Split Channels / Merge Channels...",
    "body": [
     "Split Channels は、合成画像やRGB画像を、チャンネルごとのグレースケール画像に分離します。分離後の各画像は、独立に測定・処理できます。そのため、チャンネル別定量の出発点になります。",
     "Merge Channels は、開いているグレースケール画像を各チャンネルへ割り当てて、合成画像を作ります。Create Composite を選ぶと、チャンネルを保持するコンポジット画像になります。表示の切り替えや、後からの再分離が可能です。"
    ],
    "points": [
     "Splitは、分離して定量可能にする操作です",
     "Merge＋Create Compositeは、チャンネルを保持する合成です",
     "RGBへの焼き込みは、表示用に限ります"
    ],
    "caution": "割り当てを誤ると、チャンネルの取り違えが起きます。合成後は、各チャンネルのLUTと内容を必ず確認してください。",
    "src": "https://imagej.net/mbf/colour_image_processi.htm",
    "srcName": "MBF ImageJ Manual「Colour image processing」（imagej.net 収載）",
    "version": "MBFマニュアル（imagej.net収載）の記載に基づく。現行版でも操作体系は同一である。",
    "lessons": [
     "L21"
    ],
    "terms": [
     "Merge Channels",
     "コンポジット画像",
     "チャンネル"
    ]
   }
  ]
 },
 {
  "id": "D4",
  "title": "ROIと選択",
  "intro": "ROI（関心領域）は、測定と処理の対象を指定する仕組みです。この章では、マスクやオーバーレイとの違いを整理します。ROI Managerによる管理や、保存と再利用の方法も扱います。",
  "entries": [
   {
    "id": "D4-1",
    "title": "ROI・マスク・オーバーレイの違い",
    "menu": "—（概念の区別）",
    "body": [
     "ROI（選択）は、画像上に一時的に指定された対象範囲です。同時にアクティブにできるのは1つだけです。測定や処理は、このアクティブな選択に対して行われます。",
     "マスクは、対象と背景を画素値（多くは0と255）で表した画像そのものです。データとして保存でき、演算にも使えます。一方、オーバーレイは、画像の上に重ねて表示される要素です。画素値は変えません。ROIなどの要素を複数保持でき、非破壊的な注釈や確認に使います。",
     "たとえば、「どこを測るか」を決めるのがROIです。「対象の画素集合」をデータ化したものがマスク、「見せ方」として重ねるのがオーバーレイです。こう区別すると、混乱が少なくなります。"
    ],
    "points": [
     "ROIは一時的な対象指定で、同時には1つだけです",
     "マスクは、画素値で表された対象データです",
     "オーバーレイは非破壊の重ね表示で、複数保持できます"
    ],
    "caution": "ROIを描いただけでは、画像データは変わりません。マスク化（Convert to Maskなど）して初めて、画素データになります。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行1.54系でも三者の区別は同一である。",
    "lessons": [
     "L05",
     "L10"
    ],
    "terms": [
     "ROI",
     "マスク",
     "オーバーレイ"
    ]
   },
   {
    "id": "D4-2",
    "title": "ROI Manager：複数のROIを保持し、まとめて測る",
    "menu": "Analyze > Tools > ROI Manager...",
    "body": [
     "ROI Manager は、作成した選択を一覧として保持する道具です。追加・削除・計測・描画・保存を行えます。Add（キー「t」）で現在の選択を登録します。Measure では、登録済みの全ROIをまとめて測定できます。",
     "スタックに対しては、More > Multi Measure を使います。全スライスに対して全ROIを一括測定し、結果表として得られます。時間変化や Z 方向の変化を追う測定の基盤になります。"
    ],
    "points": [
     "Addで登録し、Measureで一括測定します",
     "Multi Measureは、スタック全スライス×全ROIの測定です",
     "登録した順序が、結果表の行の対応を決めます"
    ],
    "caution": "登録漏れや順序の入れ替わりは、結果の取り違えに直結します。登録時に名前（ラベル）を付けて管理してください。",
    "src": "https://imagejdocu.list.lu/gui/analyze/tools",
    "srcName": "ImageJ Documentation Wiki「ROI Manager / Tools」",
    "version": "imagejdocu の現行記載に基づく。基本操作は User Guide 1.46r 時代から継続している。",
    "lessons": [
     "L06",
     "L18"
    ],
    "terms": [
     "ROI Manager",
     "Multi Measure",
     "Results表"
    ]
   },
   {
    "id": "D4-3",
    "title": "選択は同時に1つだけ：位置合わせと復元の基本",
    "menu": "Edit > Selection > Restore Selection",
    "body": [
     "ImageJで同時にアクティブにできる選択は、1つだけです。矢印キーで1ピクセルずつ微調整（ナッジ）できます。位置の細かな合わせ込みが可能です。",
     "消してしまった選択は、Restore Selection で復元できます。別の画像へ選択を移すときにも使います。複数の画像で同じ位置を測る場合は、ROI Managerへ登録しておく方法が確実です。"
    ],
    "points": [
     "アクティブな選択は、常に1つだけです",
     "矢印キーで、1ピクセル単位の調整ができます",
     "Restore Selectionで、復元や転用ができます"
    ],
    "caution": "新しい選択を作ると、前の選択は消えます。残したい選択は、その都度ROI Managerへ登録してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行版でも選択の仕様は同一である。",
    "lessons": [
     "L05"
    ],
    "terms": [
     "ROI",
     "Restore Selection",
     "ROI Manager"
    ]
   },
   {
    "id": "D4-4",
    "title": "ROIの保存と再利用（.roi と ROIセットZIP）",
    "menu": "Analyze > Tools > ROI Manager... > Save...",
    "body": [
     "ROI Manager の Save では、単一のROIは .roi ファイルとして、複数のROIは ZIP アーカイブとして保存されます。Open で読み戻せば、別のセッションや別の画像でも同じ選択集合を再現できます。",
     "測定条件の再現性を担保するには、画像データだけでは不十分です。ROIセットと測定設定（Set Scale / Set Measurements の内容）を一緒に保存しておくことが重要です。"
    ],
    "points": [
     "単体は .roi、複数はZIPで保存されます",
     "Openで読み戻せば、別セッションでも復元できます",
     "画像＋ROI＋測定設定を、セットで保管します"
    ],
    "caution": "ROIの座標は、画像の左上を原点とする基準です。サイズの異なる画像へ適用すると、位置がずれます。",
    "src": "https://imagejdocu.list.lu/gui/analyze/tools",
    "srcName": "ImageJ Documentation Wiki「ROI Manager / Tools」",
    "version": "imagejdocu の現行記載に基づく。保存形式は現行版でも同一である。",
    "lessons": [
     "L06"
    ],
    "terms": [
     ".roiファイル / ROIセットZIP",
     "ROI Manager"
    ]
   }
  ]
 },
 {
  "id": "D5",
  "title": "測定とResults",
  "intro": "Measureの値は、Set Scale（空間校正）と Set Measurements（記録項目）の設定に全面的に依存します。この章では、値の意味を説明します。単位がおかしいときの切り分け方や、粒子数が合わないときの点検手順もまとめます。",
  "entries": [
   {
    "id": "D5-1",
    "title": "Mean Gray Valueとは：選択内のグレー値の平均",
    "menu": "Analyze > Set Measurements... / Analyze > Measure",
    "body": [
     "Mean Gray Value（平均グレー値）は、選択範囲内のグレー値の合計をピクセル数で割った値です。蛍光画像では「その領域の平均的な信号強度」として使われます。ただし、あくまで平均です。総量ではありません。",
     "総量に相当する指標が必要な場合は、面積×平均を使います（Integrated Density の考え方です）。平均だけを比較すると、面積の異なる対象同士で、総量の大小を取り違えます。",
     "なお、Mean が記録されるかどうかは、Set Measurements の設定に依存します。結果表に項目が現れない場合は、まず記録項目の指定を確認してください。"
    ],
    "points": [
     "Meanは、グレー値の合計 ÷ ピクセル数（平均強度）です",
     "総量は、面積×平均で評価します",
     "記録の有無は、Set Measurements で決まります"
    ],
    "caution": "RGB画像で測るMeanは、輝度ベースの値です。チャンネル別の強度ではありません。蛍光の定量は、分離したグレースケールで行ってください。",
    "src": "https://imagej.net/ij/docs/menus/analyze.html",
    "srcName": "ImageJ 公式ドキュメント「Analyze Menu」",
    "version": "User Guide 1.46r 系の Analyze メニュー解説に基づく。Mean の定義は現行1.54系でも同一である。",
    "lessons": [
     "L08",
     "L18"
    ],
    "terms": [
     "Mean Gray Value",
     "Set Measurements",
     "Measure"
    ]
   },
   {
    "id": "D5-2",
    "title": "Set Scale：ピクセルを実寸へ校正する",
    "menu": "Analyze > Set Scale...",
    "body": [
     "Set Scale は、空間校正の手続きです。ピクセル数と既知の距離との対応を登録します。既知の距離は、スケールバーや撮影条件から得た実長です。校正が済んだ画像では、Area や長さの測定結果が、ピクセル数ではなく校正単位（µm など）で報告されます。",
     "校正情報は画像ごとに保持されます。保存したときに保持されるのは、TIFF/ZIP形式の場合です。通常形式の中で校正情報を保存できるのは、この形式に限られます。この点も重要です。",
     "「Global」にすると、新しく開く画像にも同じ校正を適用する設定になります。倍率の異なる画像を扱う環境では注意が必要です。意図しない適用が、誤差の原因になります。"
    ],
    "points": [
     "校正済みなら、結果は実寸単位で報告されます",
     "校正情報は、TIFF/ZIP保存で保持されます",
     "Global設定は、倍率違いの画像で誤差の元になります"
    ],
    "caution": "校正は、撮影倍率やビニング条件ごとに異なります。条件が変わるたびに、校正し直してください。",
    "src": "https://imagej.net/ij/docs/menus/analyze.html",
    "srcName": "ImageJ 公式ドキュメント「Analyze Menu」",
    "version": "User Guide 1.46r 系の解説に基づく。校正の仕組みは現行版でも同一である。",
    "lessons": [
     "L07",
     "L20"
    ],
    "terms": [
     "Set Scale",
     "Area",
     "スケールバー"
    ]
   },
   {
    "id": "D5-3",
    "title": "測定単位がおかしいとき：点検の順序",
    "menu": "Analyze > Set Scale... / Image > Properties...",
    "body": [
     "測定結果の単位や桁がおかしい場合、原因はほぼ次のいずれかです。(1) Set Scale が未設定で、結果がピクセル単位のままになっている。(2) 前の画像で設定した校正が、Global 設定により、別の倍率の画像へ適用されている。(3) 画素サイズの入力ミスです。単位の取り違えや、µm と mm の混同などが該当します。",
     "切り分けは、次の順序で行います。まず Image > Properties で現在の校正値を確認します。次に、既知の長さ（スケールバーなど）を実際に測り、実寸と一致するか検証します。校正が不要な測定（個数など）と、校正が前提の測定（面積・長さ）を区別することも重要です。",
     "スケールバーを入れる作業は、この校正が正しく済んでいることが前提です。校正がない状態のバーは、実寸と対応しません。"
    ],
    "points": [
     "原因の典型は、未校正／Global の誤適用／単位入力ミスです",
     "Propertiesで校正値を確認し、既知の長さで検証します",
     "個数は校正不要、面積・長さは校正が前提です"
    ],
    "caution": "校正値を直したら、直す前に得た測定結果は破棄して、測り直してください。混在させると、表の途中で単位が変わってしまいます。",
    "src": "https://imagej.net/ij/docs/menus/analyze.html",
    "srcName": "ImageJ 公式ドキュメント「Analyze Menu」",
    "version": "User Guide 1.46r 系の解説に基づく切り分け手順。現行版でも校正の保持方法は同じである。",
    "lessons": [
     "L07",
     "L20"
    ],
    "terms": [
     "Set Scale",
     "Area",
     "スケールバー"
    ]
   },
   {
    "id": "D5-4",
    "title": "Set Measurements：記録される項目は事前に決まっている",
    "menu": "Analyze > Set Measurements...",
    "body": [
     "Measure や Analyze Particles が Results 表へ記録する項目は、事前に指定されたものだけです。指定は Set Measurements ダイアログで行います。面積、平均グレー値、最小・最大、重心、面積率（Area Fraction）などが、ここで選ばれます。",
     "「測ったはずの項目が表にない」場合は、測定の失敗ではないことが多いです。記録項目が未指定なだけです。逆に、不要な項目を多く指定すると、表が読みにくくなります。目的に応じた最小限の指定が望ましいです。",
     "面積率のように、閾値処理と組み合わせて初めて意味を持つ項目もあります。項目の意味を理解してから指定してください。"
    ],
    "points": [
     "記録項目は、Set Measurements で事前に指定します",
     "項目が無いのは、未指定であることが多いです",
     "目的に応じた項目だけを指定します"
    ],
    "caution": "同じ実験の一連の測定では、記録項目を統一してください。途中で変えると表の列構成が変わり、比較が困難になります。",
    "src": "https://imagej.net/ij/docs/menus/analyze.html",
    "srcName": "ImageJ 公式ドキュメント「Analyze Menu」",
    "version": "User Guide 1.46r 系の解説に基づく。現行版でも記録項目の仕組みは同一である。",
    "lessons": [
     "L08",
     "L17"
    ],
    "terms": [
     "Set Measurements",
     "Measure",
     "Results表"
    ]
   },
   {
    "id": "D5-5",
    "title": "Analyze Particlesで数が合わないとき：原因の切り分け",
    "menu": "Analyze > Analyze Particles...",
    "body": [
     "Analyze Particles は、オブジェクトを数えて計測するコマンドです。二値化または閾値処理された画像を走査します。数が合わない場合の原因は、多くの場合、次のいずれかです。(1) 閾値の範囲が不適切で、対象の取りこぼしや背景の誤検出がある。(2) Size の範囲指定で、対象が除外されている。(3) 接触した粒子が分離されず、1個として数えられている。(4) 画像端に触れた粒子の扱い（Exclude on Edges）の設定です。",
     "切り分けは、次の順序が有効です。まず、二値化結果を元画像と重ねて、目視で照合します。次に、Size・Circularity の条件を緩めて数え直します。最後に、Watershed などの分離処理が必要かどうかを判断します。Summarize を有効にすると、個数・合計面積・平均サイズ・面積率が Summary に集計されます。",
     "粒子解析は、前提条件（二値化の品質）に結果が全面的に依存するコマンドです。数を合わせにいくための安易な条件変更は、再現性を損ないます。条件は記録し、固定して使ってください。"
    ],
    "points": [
     "原因の典型は、閾値／Size範囲／接触粒子の未分離／端の扱いです",
     "二値化結果と元画像の重ね合わせで照合します",
     "条件は記録して固定し、場当たり的に変えません"
    ],
    "caution": "Summarize の面積率（%Area）も、閾値と Size 条件に依存する値です。条件を併記せずに、数値だけを報告してはいけません。",
    "src": "https://imagej.net/ij/docs/menus/analyze.html",
    "srcName": "ImageJ 公式ドキュメント「Analyze Menu」",
    "version": "User Guide 1.46r 系の解説に基づく。現行1.54系でも粒子解析の前提と設定項目は同一である。",
    "lessons": [
     "L08",
     "L16"
    ],
    "terms": [
     "Analyze Particles",
     "閾値処理（Threshold）",
     "Watershed"
    ]
   }
  ]
 },
 {
  "id": "D6",
  "title": "閾値・二値化・形態学処理",
  "intro": "閾値の「設定」と画素値の「変換」は、別の操作です。この区別や、Dark/Black Background の取り違え、Watershed の適用限界など、誤解の多い領域を整理します。",
  "entries": [
   {
    "id": "D6-1",
    "title": "ThresholdとConvert to Maskの違い",
    "menu": "Image > Adjust > Threshold... / Process > Binary > Convert to Mask",
    "body": [
     "Threshold は、強度の範囲を指定する操作です。「対象ピクセルと背景ピクセルをどう分けるか」という基準を定めます。閾値を設定しただけでは、画素値そのものは書き換わりません。表示上で範囲内のピクセルが赤く示されるのは、指定の可視化です。",
     "これに対して Convert to Mask は、画像を実際に変換するコマンドです。現在の閾値設定に基づき、白黒（0と255）のマスク画像へ変換します。画素値が書き換わるのは、この時点です。",
     "同様に、Process > Binary > Make Binary も二値化コマンドです。閾値の扱いは Convert to Mask と共通しています。「設定済みの閾値があればそれを使い、未設定なら自動で決める」という扱いです。両者の違いは、閾値の決め方ではありません。主に、結果の形式（マスクとして扱うかどうか）にあります。"
    ],
    "points": [
     "Thresholdは、分ける基準の設定で、画素値は変わりません",
     "Convert to Maskは、現在の閾値（未設定なら自動決定）でマスク化します",
     "Make Binaryは、同じ閾値の扱いで画像を二値化します"
    ],
    "caution": "閾値を合わせただけで「二値化した」と誤解すると、その後の処理がすべて、閾値未適用の画像に対して行われてしまいます。",
    "src": "https://imagejdocu.list.lu/gui/process/binary",
    "srcName": "ImageJ Documentation Wiki「Binary」",
    "version": "imagejdocu の現行記載に基づく。",
    "lessons": [
     "L09",
     "L10"
    ],
    "terms": [
     "閾値処理（Threshold）",
     "Convert to Mask",
     "Make Binary",
     "マスク"
    ]
   },
   {
    "id": "D6-2",
    "title": "閾値を設定しても画素値が変わらない理由と、値が変わる操作",
    "menu": "Image > Adjust > Threshold...",
    "body": [
     "Threshold ウィンドウでの調整は、あくまで「どの範囲を対象とみなすか」の指定です。元画像のデータには触れません。そのため、閾値を設定した状態で Measure を行っても、それは元画像の値に対する測定です。この指定を利用するのは、Analyze Particles のように閾値を参照するコマンドだけです。",
     "画素値が実際に変わるのは、次の操作のときです。Threshold ウィンドウの Apply を押したときと、二値化コマンド（Make Binary / Convert to Mask）を実行したときです。どの操作で値が変わるかを意識することが、定量データの保全に直結します。"
    ],
    "points": [
     "閾値の指定は、データを壊さない「指定」です",
     "値が変わるのは、Apply や二値化コマンドの実行時です",
     "閾値を参照するのは、Analyze Particles などの特定コマンドです"
    ],
    "caution": "Apply 後の画像を保存すると、元の階調は失われます。適用は複製画像で行ってください。",
    "src": "https://imagejdocu.list.lu/gui/process/binary",
    "srcName": "ImageJ Documentation Wiki「Binary」",
    "version": "imagejdocu の現行記載に基づく。",
    "lessons": [
     "L09",
     "L10"
    ],
    "terms": [
     "閾値処理（Threshold）",
     "二値画像（バイナリ）"
    ]
   },
   {
    "id": "D6-3",
    "title": "Dark BackgroundとBlack Backgroundの違い",
    "menu": "Image > Adjust > Threshold... / Process > Binary > Options...",
    "body": [
     "名前が似ているため混同されやすい設定です。しかし、この2つは別のダイアログの、別の意味を持つ設定です。Threshold ウィンドウの Dark Background は、閾値範囲の解釈を指定します。暗い背景に対して明るい対象を切り分ける際に、「背景が暗いこと」を示す指定です。",
     "一方、Process > Binary > Options の Black Background は、二値画像についての設定です。「黒いピクセル側を背景として扱うか」を決めます。対象と背景のどちらとして画素を数えるかという、二値化後の解釈全体に影響します。",
     "取り違えると、対象と背景が反転したまま解析が進んでしまいます。面積率や個数が、すべて逆転した結果になります。"
    ],
    "points": [
     "Dark Backgroundは Threshold 側の、暗背景の解釈指定です",
     "Black Backgroundは Binary Options 側の、対象/背景の解釈です",
     "反転ミスは、面積率・個数の全反転につながります"
    ],
    "caution": "二値化結果が意図と反転していたら、まずこの2つの設定を確認してください。",
    "src": "https://imagejdocu.list.lu/gui/process/binary",
    "srcName": "ImageJ Documentation Wiki「Binary」",
    "version": "imagejdocu の現行記載に基づく。設定の所在と意味は現行版でも同一である。",
    "lessons": [
     "L09",
     "L10"
    ],
    "terms": [
     "Black Background",
     "閾値処理（Threshold）",
     "二値画像（バイナリ）"
    ]
   },
   {
    "id": "D6-4",
    "title": "自動閾値とOtsu法：手法の前提を理解する",
    "menu": "Image > Adjust > Threshold...（Method の選択）",
    "body": [
     "自動閾値の手法は数多くあります。Default（IsoData系）、Otsu、Huang、Li、MaxEntropy、Triangle などです。それぞれ、「何を最適とみなすか」の前提が異なります。万能な手法はありません。ヒストグラムの形状に合った選択が必要です。",
     "代表的な Otsu 法は、2クラスの分かれ方が最もよくなる閾値を選びます。具体的には、クラス内分散が最小（＝クラス間分散が最大）になる閾値です。対象と背景が明確に分かれた二峰性のヒストグラムに向きます。一方、対象が極端に小さい場合や、背景が不均一な場合は、適切な閾値にならないことがあります。",
     "どの手法を使ったかは、結果を左右する条件です。手法名と、対象画像の前処理を記録することが、再現性の前提になります。"
    ],
    "points": [
     "手法ごとに、最適化の前提が異なります",
     "Otsuは、二峰性のヒストグラムに向きます",
     "手法名と前処理を記録します"
    ],
    "caution": "自動閾値の結果を、無検証で採用してはいけません。元画像との重ね合わせで、妥当性を必ず確認してください。",
    "src": "https://imagejdocu.list.lu/gui/process/binary",
    "srcName": "ImageJ Documentation Wiki「Binary」および自動閾値手法の解説",
    "version": "imagejdocu 現行記載に基づく。手法一覧は現行版の Threshold ダイアログと対応する。",
    "lessons": [
     "L09"
    ],
    "terms": [
     "Otsu法",
     "閾値処理（Threshold）",
     "ヒストグラム"
    ]
   },
   {
    "id": "D6-5",
    "title": "Watershedが不適切な場合",
    "menu": "Process > Binary > Watershed",
    "body": [
     "Watershed は、接触した粒子同士の境界を推定して分離する処理です。距離マップと、その極大点をもとに境界を決めます。滑らかで凸形状に近く、重なりの少ない粒子の分離には有効です。",
     "一方、次のような対象ではうまくいきません。形状が不規則で凹凸の多い対象、内部に窪みのある対象、大きく重なり合った対象です。窪みごとに過分割したり、誤った位置で切断したりします。距離マップの極大点が、対象1つに対して複数現れる形状では、原理的に過分割が避けられません。",
     "分離結果は、必ず元画像と照合してください。過分割や未分離の傾向を確認します。形状が複雑な対象では、Watershed に頼らない方がよい場合があります。閾値や前処理の改善、あるいは面積ベースの集計への切り替えを検討すべきです。"
    ],
    "points": [
     "原理は、距離マップの極大点から境界を引くことです",
     "凹凸や重なりの大きい対象では、過分割や誤切断が起きます",
     "分離結果は、元画像との照合が必須です"
    ],
    "caution": "過分割された数は、「数えられた個数」としてそのまま報告できません。分離の成否は、画像ごとに判断してください。",
    "src": "https://imagejdocu.list.lu/gui/process/binary",
    "srcName": "ImageJ Documentation Wiki「Binary」",
    "version": "imagejdocu の現行記載に基づく。適用限界は一次情報で確認のうえ収録した。",
    "lessons": [
     "L16"
    ],
    "terms": [
     "Watershed",
     "距離マップ",
     "Analyze Particles"
    ]
   },
   {
    "id": "D6-6",
    "title": "形態学処理（モルフォロジー演算）の基礎：Erode / Dilate / Open / Close",
    "menu": "Process > Binary > Erode / Dilate / Open / Close",
    "body": [
     "形態学処理は、二値画像の形状に対して行う演算の総称です。Erode（侵食）は対象を一回り小さくします。小さな突起や細い連結を取り除きます。Dilate（膨張）は対象を一回り大きくします。小さな欠けを埋めます。",
     "Open は、侵食→膨張の組み合わせです。小さなノイズ状の対象を取り除きつつ、大きな対象の形を概ね保ちます。Close は、膨張→侵食の組み合わせです。対象内部の小さな穴や切れ目を埋めます。",
     "これらは形状を変える処理です。面積や個数の測定前に適用すると、結果も変わります。適用の有無と回数は、測定条件として記録しなければなりません。"
    ],
    "points": [
     "Erodeは縮小、Dilateは拡大が基本演算です",
     "Openは小ノイズ除去、Closeは穴・切れ目埋めです",
     "形状の変更は、測定値に直接影響します"
    ],
    "caution": "見た目を整えるための形態学処理は、定量値の改変でもあります。解析前に適用する場合は、目的と根拠を明示してください。",
    "src": "https://imagejdocu.list.lu/gui/process/binary",
    "srcName": "ImageJ Documentation Wiki「Binary」",
    "version": "imagejdocu の現行記載に基づく。各演算の定義は現行版でも同一である。",
    "lessons": [
     "L10",
     "L16"
    ],
    "terms": [
     "モルフォロジー演算",
     "二値画像（バイナリ）"
    ]
   }
  ]
 },
 {
  "id": "D7",
  "title": "フィルタと画像演算",
  "intro": "フィルタは、「近傍の値から新しい値を計算する」処理です。常に見た目と引き換えに、情報を変えてしまいます。この章では、各フィルタの原理と副作用を整理します。演算時の型の問題も扱います。",
  "entries": [
   {
    "id": "D7-1",
    "title": "平滑化フィルタの原理と副作用：Smooth / Mean / Gaussian Blur",
    "menu": "Process > Smooth / Process > Filters > Mean... / Gaussian Blur...",
    "body": [
     "平滑化は、細かな変動（ノイズ）を抑える処理です。各ピクセルを、近傍の平均的な値で置き換えます。Smooth は3×3近傍の平均です。Mean フィルタは、Radius で指定した近傍の平均です。Gaussian Blur は、ガウス関数で重み付けした平均（畳み込み）です。Sigma は、ガウス関数の標準偏差σを表します。",
     "副作用もあります。エッジは鈍ります。細い構造は周囲に溶け込みます。ピークの最大値は下がります。強度を定量する画像では、平滑化の適用がそのまま測定値の変化になります。",
     "ノイズ低減の効果と情報の損失は、表裏一体です。「きれいに見える」ことと「正しく測れる」ことは、同義ではありません。定量前の平滑化は、必要性とパラメータを明示して行ってください。"
    ],
    "points": [
     "平滑化は近傍の平均化で、Gaussianは重み付き平均です",
     "副作用は、エッジの鈍化、ピーク値の低下、細構造の消失です",
     "定量値そのものが変わる処理です"
    ],
    "caution": "取得条件の異なる画像に、同じ見た目を求めて平滑化を変えると、比較可能性が失われます。条件は統一してください。",
    "src": "https://imagejdocu.list.lu/gui/process/filters",
    "srcName": "ImageJ Documentation Wiki「Filters」",
    "version": "imagejdocu の現行記載に基づく。Gaussian の Sigma の定義は User Guide（Process Menu）でも確認済みである。",
    "lessons": [
     "L11"
    ],
    "terms": [
     "Gaussian Blur",
     "Meanフィルタ",
     "Smooth",
     "SNR"
    ]
   },
   {
    "id": "D7-2",
    "title": "Medianフィルタ：平均ではなく中央値で置き換える",
    "menu": "Process > Filters > Median...",
    "body": [
     "Median フィルタは、各ピクセルを近傍の値の中央値で置き換えます。平均と違い、外れ値（飛び値）の影響を受けにくいのが特徴です。そのため、孤立した極端に明るい点や暗い点（塩胡椒状ノイズ）の除去に向きます。",
     "エッジの保存性も、平均系より高いです。ただし、近傍（Radius）を大きくすると、細い線状構造が消えるなどの副作用があります。対象の大きさに対して、十分小さい Radius を選ぶことが原則です。"
    ],
    "points": [
     "中央値で置き換えるため、飛び値に強いです",
     "塩胡椒状ノイズの除去に向きます",
     "Radiusが大きいと、細構造が消えます"
    ],
    "caution": "中央値もまた、画素値の書き換えです。定量画像への適用は、平滑化と同様に、値の変化を伴う点を意識してください。",
    "src": "https://imagejdocu.list.lu/gui/process/filters",
    "srcName": "ImageJ Documentation Wiki「Filters」",
    "version": "imagejdocu の現行記載に基づく。定義は現行版でも同一である。",
    "lessons": [
     "L11"
    ],
    "terms": [
     "Medianフィルタ",
     "Gaussian Blur"
    ]
   },
   {
    "id": "D7-3",
    "title": "Unsharp Mask：ぼかしたコピーを差し引いてエッジを強調する",
    "menu": "Process > Filters > Unsharp Mask...",
    "body": [
     "Unsharp Mask は、エッジや細部を強調するフィルタです。元の画像から「Gaussian Blur でぼかしたコピー」を差し引いて強調します。パラメータは、Radius＝差し引くぼかしのσ、Mask Weight＝差し引きの強さ（フィルタ強度）です。",
     "Mask Weight を大きくしすぎると、問題が起きます。エッジの周囲に過強調の縁（ハロー）が現れます。ピーク値は実物以上に跳ね上がります。強調された画像は観察には有用です。しかし、強度の定量には使えません。",
     "似た名前の Sharpen とは別の処理です。Sharpen は、3×3の重み付き平均による強調です。パラメータの意味も異なります。"
    ],
    "points": [
     "原理は、原画像 − ぼかしたコピーによるエッジ強調です",
     "Radiusはぼかしのσ、Mask Weightは強さです",
     "過強調では、ハローとピーク値の増大が起きます"
    ],
    "caution": "強調処理後の画像で、強度を測ってはいけません。定量は未加工データで行い、強調は表示・観察用に限ってください。",
    "src": "https://imagej.net/ij/docs/guide/146-29.html",
    "srcName": "ImageJ User Guide「Process Menu」（29章）",
    "version": "User Guide 1.46r の Process Menu 解説に基づく。パラメータの意味は現行版でも同一である。",
    "lessons": [
     "L11"
    ],
    "terms": [
     "Unsharp Mask",
     "Sharpen",
     "Gaussian Blur"
    ]
   },
   {
    "id": "D7-4",
    "title": "Gamma補正：式と適用範囲",
    "menu": "Process > Math > Gamma...",
    "body": [
     "Gamma 補正は、画素値にべき乗を適用する階調変換です。8-bit画像では、f(p) = (p/255)^gamma × 255 の形で計算されます。gamma の指定範囲は 0.05〜5.0 です。gamma が1より小さいと中間調が持ち上がり、大きいと沈みます。",
     "適用範囲には注意が必要です。16-bit画像では、画像の最小値・最大値でスケーリングしてから、同じ考え方を適用します。つまり、同じ gamma 値でも、画像の値域によって結果の対応は異なります。",
     "Gamma は非線形変換です。強度の比例関係を崩します。表示の調整として使う分には問題ありません。しかし、補正後の画像で強度比を論じることはできません。"
    ],
    "points": [
     "8-bitでは (p/255)^gamma×255 で、範囲は0.05〜5.0です",
     "16-bitでは、最小・最大でスケーリングして適用します",
     "非線形変換のため、強度比が崩れます"
    ],
    "caution": "定量解析に、Gamma 補正後の画像を使ってはいけません。",
    "src": "https://imagejdocu.list.lu/gui/process/math",
    "srcName": "ImageJ Documentation Wiki「Math」",
    "version": "imagejdocu の現行記載に基づく。式と範囲は一次情報により確認済みである。",
    "lessons": [
     "L13"
    ],
    "terms": [
     "Gamma",
     "Math（Process > Math）"
    ]
   },
   {
    "id": "D7-5",
    "title": "Image Calculator と 32-bit Result：演算で値を潰さない",
    "menu": "Process > Image Calculator...",
    "body": [
     "Image Calculator は、2枚の画像同士の演算に使うコマンドです。加減乗除や論理演算（AND など13種の演算子）が使えます。差分画像の作成、背景画像の引き算、マスクによる共通部分の抽出などに使います。",
     "重要なのは、結果の型です。「32-bit Result」を指定すると、結果は浮動小数で保持されます。負の値や小数、範囲外の値も潰れません。指定しない場合、整数型の範囲に丸められます。差分が負になる部分などが失われます。なお、標準設定では、ゼロ除算の結果は Infinity や NaN として現れます。",
     "演算は、ピクセル位置が完全に対応していることが前提です。サイズや位置のずれた画像同士の演算は、意味を持ちません。"
    ],
    "points": [
     "2画像間の算術・論理演算です（13演算子）",
     "32-bit Resultで、負値・小数を保持できます",
     "位置合わせが、演算の前提条件です"
    ],
    "caution": "整数型のまま差分を取ると、負の差分が0に潰れます。変化を過小評価してしまいます。差分・除算系では、32-bit結果を原則としてください。",
    "src": "https://imagejdocu.list.lu/gui/process/image_calculator",
    "srcName": "ImageJ Documentation Wiki「Image Calculator」",
    "version": "imagejdocu の現行記載に基づく。ゼロ除算の扱いは「標準設定では」という留保付きで確認済みである。",
    "lessons": [
     "L13"
    ],
    "terms": [
     "Image Calculator",
     "Infinity / NaN",
     "AND演算（画像）",
     "背景差し引き"
    ]
   }
  ]
 },
 {
  "id": "D8",
  "title": "背景補正",
  "intro": "背景補正は、「信号を取り出す」処理です。同時に、「信号を変える」処理でもあります。この章では、Subtract Background の仕組みを説明します。ローリングボール半径の決め方や、補正で値が変わる理由も整理します。",
  "entries": [
   {
    "id": "D8-1",
    "title": "Subtract Background とローリングボールの考え方",
    "menu": "Process > Subtract Background...",
    "body": [
     "Subtract Background は、「滑らかな背景」を推定し、それを差し引いて背景を均すコマンドです。推定の考え方は、ボールの転がりです。ピクセル値を高さとみた曲面の裏側を、ボールが転がる軌跡として背景を推定します。照明ムラのある画像で、場所によって閾値や強度がずれる問題への前処理として使います。",
     "Rolling Ball Radius は、背景推定のスケールを決めます。目安は画像の種類で異なります。8-bitやRGBでは、「背景ではない最大の対象の半径」以上に取るのが原則です。画素値の範囲が大きく異なる画像では、半径は値の範囲に反比例する方向へ調整します。16-bit画像（画素値0〜65535）では、0.2〜5程度が典型値とされます。",
     "明るい背景に暗い対象がある画像では、Light Background を指定します。Sliding Paraboloid を選ぶと、方式が切り替わります。ボールではなく、放物面で背景を近似する方式になります。"
    ],
    "points": [
     "背景を推定して差し引く前処理です",
     "半径の目安は型で異なります（8-bit/RGB：最大対象の半径以上）",
     "明背景＋暗対象では、Light Background を指定します"
    ],
    "caution": "対象より小さい半径では、対象自体が背景として差し引かれてしまいます。Preview で、対象が消えていないか確認してください。",
    "src": "https://imagejdocu.list.lu/gui/process/subtract_background",
    "srcName": "ImageJ Documentation Wiki「Subtract Background」",
    "version": "imagejdocu の現行記載に基づく。半径の適用範囲は一次情報により確認した内容である。",
    "lessons": [
     "L19"
    ],
    "terms": [
     "Subtract Background",
     "ローリングボール半径"
    ]
   },
   {
    "id": "D8-2",
    "title": "背景補正で信号が変わる理由",
    "menu": "Process > Subtract Background...（適用時の注意）",
    "body": [
     "背景補正は、「信号＋背景」の合計から推定した背景分を差し引く操作です。引くのは、測定したい信号そのものではありません。ただし推定背景には、真の背景だけでなく、対象の裾野や広がった成分まで含まれることがあります。そのため、補正後のピーク値や積算値は補正前と変わります。",
     "特に、対象より小さい半径や不適切な方式では、対象の信号成分まで差し引かれます。強度が系統的に過小になります。逆に、背景の推定が不十分だと、場所によるバラつきが残ります。",
     "したがって、背景補正は「値の正しさ」を自動で保証する処理ではありません。補正のパラメータ自体が、測定条件の一部です。画像間で比較する場合は、同一の補正条件を全画像に適用してください。条件を記録することも必須です。"
    ],
    "points": [
     "引かれるのは推定背景で、対象の裾野も含まれ得ます",
     "パラメータが不適切だと、信号まで差し引かれます",
     "比較する全画像で、同一条件を適用し、記録します"
    ],
    "caution": "補正前後の値を混ぜて比較してはいけません。補正は、全データに一貫して適用するか、しないかを統一してください。",
    "src": "https://imagejdocu.list.lu/gui/process/subtract_background",
    "srcName": "ImageJ Documentation Wiki「Subtract Background」",
    "version": "imagejdocu の現行記載（背景推定の仕組み）に基づく独自解説。原理の説明として現行版でも有効である。",
    "lessons": [
     "L19",
     "L18"
    ],
    "terms": [
     "Subtract Background",
     "背景差し引き",
     "Mean Gray Value"
    ]
   },
   {
    "id": "D8-3",
    "title": "背景ROIによる補正：対象の平均から背景の平均を引く",
    "menu": "Analyze > Tools > ROI Manager... / Analyze > Measure",
    "body": [
     "蛍光強度の評価では、次の方法が基本になります。対象ROIと背景ROI（対象のない領域）を ROI Manager に登録し、それぞれ Measure します。そして、対象の Mean から背景の Mean を差し引きます。これは「平均強度」の補正です。総量の補正とは区別してください。",
     "背景ROIの置き方（場所・大きさ・個数）で、結果は変わります。そのため、選び方のルールを決めて、全画像で統一してください。撮影条件や前処理の条件が異なる画像同士では、この補正をしても比較可能性は回復しません。",
     "スタック全体に同じROI群で適用する場合は、Multi Measure が使えます。"
    ],
    "points": [
     "補正は、対象Mean − 背景Meanです（平均強度）",
     "背景ROIの選び方をルール化し、統一します",
     "取得条件の異なる画像は、補正しても比較できません"
    ],
    "caution": "背景ROIを対象のすぐ近くに置くと、対象の広がった信号まで背景として引いてしまいます。置き方の根拠を記録してください。",
    "src": "https://imagejdocu.list.lu/gui/analyze/tools",
    "srcName": "ImageJ Documentation Wiki「ROI Manager / Tools」",
    "version": "imagejdocu の現行記載に基づく。",
    "lessons": [
     "L18"
    ],
    "terms": [
     "ROI Manager",
     "Mean Gray Value",
     "Multi Measure"
    ]
   }
  ]
 },
 {
  "id": "D9",
  "title": "スタックとZ投影",
  "intro": "スタックは、「同サイズ・同深度の画像の束」です。ハイパースタックは、それにチャンネルと時間の軸を加えたものです。この章では、Z投影の方式選択と、スタック測定の基本を整理します。",
  "entries": [
   {
    "id": "D9-1",
    "title": "スタックとハイパースタックの構造",
    "menu": "Image > Stacks / Image > Hyperstacks",
    "body": [
     "スタックは、複数の画像（スライス）を1つのウィンドウにまとめたものです。全スライスが同じサイズ・同じビット深度であることが前提になります。Z方向（深さ）の断層像の並びとして扱うのが典型です。",
     "ハイパースタックは、スタックの拡張です。x・y に加えて、z（深さ）、c（チャンネル）、t（時間）の軸を持ちます。4D/5Dデータを扱います。軸の取り違え（チャンネルと時間の混同など）は、解析全体の誤りの元になります。",
     "メモリに収まらない画像列は、仮想スタックとして開けます。ただし、ディスク常駐のため読み取り専用です。処理の適用には制限があります。"
    ],
    "points": [
     "スタックは、全スライスが同サイズ・同深度であることが前提です",
     "ハイパースタックは、z・c・t の軸を持ちます",
     "仮想スタックは、読み取り専用です"
    ],
    "caution": "読み込む際に、軸の割り当てを確認してください。c と t の取り違えは、見た目では気づきにくいものです。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行1.54系でもスタックの構造は同一である。",
    "lessons": [
     "L04"
    ],
    "terms": [
     "スタック",
     "ハイパースタック",
     "仮想スタック",
     "スライス",
     "ボクセル"
    ]
   },
   {
    "id": "D9-2",
    "title": "Z投影の方式は「何を見たいか」で選ぶ",
    "menu": "Image > Stacks > Z Project...",
    "body": [
     "Z Project は、スタックを Z 方向に投影して、1枚の画像にまとめる処理です。方式は6種あります。Average Intensity（平均）、Maximum Intensity（最大）、Minimum Intensity（最小）、Sum Slices（合計）、Standard Deviation（標準偏差）、Median（中央値）です。",
     "方式は、「何を見たいか」で選びます。蛍光の構造を際立たせたい場合は Maximum が候補です。ノイズを抑えて平均的な分布を見たい場合は Average です。総量に比例する指標が欲しい場合は Sum です。方式によって画素値の意味はまったく異なります。そのため、「投影した」という事実だけでなく、方式名を記録することが必須です。",
     "開始・終了スライスを指定して、一部の範囲だけを投影することもできます。範囲の指定も、結果を左右する条件です。"
    ],
    "points": [
     "方式は6種です：平均／最大／最小／合計／標準偏差／中央値",
     "方式で画素値の意味が変わるため、記録が必須です",
     "投影範囲（開始・終了スライス）も条件の一部です"
    ],
    "caution": "Maximum投影は、ノイズの最大値も拾います。定量に使う場合は、方式の選択根拠を明示してください。",
    "src": "https://imagej.net/imaging/z-functions",
    "srcName": "imagej.net「Z-functions」解説",
    "version": "imagej.net の現行解説に基づく。投影方式は現行仕様の6種で確認した（旧 User Guide 本文には5方式と読める記述が残る）。",
    "lessons": [
     "L22"
    ],
    "terms": [
     "Z投影",
     "スタック"
    ]
   },
   {
    "id": "D9-3",
    "title": "Multi Measure：スタックの全スライスを同じROI群で測る",
    "menu": "Analyze > Tools > ROI Manager... > More > Multi Measure",
    "body": [
     "Multi Measure は、一括測定の機能です。ROI Manager に登録した全ROIを、スタックの全スライスに対して測定し、結果表として出力します。時間経過や Z 方向の各位置での強度変化を、同じ領域定義で追跡できます。",
     "結果の並びは、出力形式の設定で変わります。たとえば、1スライスにつき全ROI分を1行にするかどうかです。解析ソフトへ渡す前に、行と ROI・スライスの対応を、小さなデータで確認しておくことが安全です。"
    ],
    "points": [
     "全スライス×全ROIの一括測定です",
     "出力形式で、行の対応が変わります",
     "本番前に、小さなデータで対応関係を確認します"
    ],
    "caution": "ROIの登録順やスライス範囲を途中で変えると、行の対応がずれます。時系列の取り違えが起きます。",
    "src": "https://imagejdocu.list.lu/gui/analyze/tools",
    "srcName": "ImageJ Documentation Wiki「ROI Manager / Tools」",
    "version": "imagejdocu の現行記載に基づく。現行版でも Multi Measure の仕様は同一である。",
    "lessons": [
     "L06",
     "L18"
    ],
    "terms": [
     "Multi Measure",
     "ROI Manager",
     "スタック"
    ]
   },
   {
    "id": "D9-4",
    "title": "仮想スタックの制約：開けることと処理できることは別",
    "menu": "File > Import > Image Sequence...（仮想スタックとして開く）",
    "body": [
     "仮想スタックは、画像データをメモリではなくディスク上に置くスタックです。メモリに収まらない大きな画像列を、開いて閲覧できます。代償として読み取り専用です。画素値を書き換える処理は適用できません。",
     "大きなデータの確認や、測定対象の選定には有効です。ただし、フィルタや変換などの処理が必要な場合は、別の手順になります。対象を絞って、通常のスタックとして読み込み直す運用になります。"
    ],
    "points": [
     "ディスク常駐で、大容量を開けます",
     "読み取り専用のため、画素の書き換えはできません",
     "処理が必要なら、範囲を絞って再読込します"
    ],
    "caution": "「開けた」ことをもって「解析できる」と判断してはいけません。処理できるかどうかは、事前に小さな範囲で試してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行版でも仮想スタックは読み取り専用である。",
    "lessons": [
     "L04"
    ],
    "terms": [
     "仮想スタック",
     "スタック"
    ]
   }
  ]
 },
 {
  "id": "D10",
  "title": "マクロとバッチ処理",
  "intro": "マクロは、「手作業の手順を再現可能な記録に変える」仕組みです。この章では、Recorderによる作成の流れを説明します。バッチモードによる高速化や、フォルダ一括処理と出力の注意点も整理します。",
  "entries": [
   {
    "id": "D10-1",
    "title": "マクロの基本：run() でコマンドを実行する",
    "menu": "Plugins > Macros > Record... / Run",
    "body": [
     "ImageJマクロは、Java に似たマクロ言語で書かれたテキスト（.ijm など）です。中心となるのは run() 関数です。400を超えるメニューコマンドを、パラメータ付きで実行できます。コマンドレコーダは、GUI 操作から run() 呼び出しを生成します。そのため、手作業の手順をそのままマクロ化の出発点にできます。",
     "組み込み関数を使えば、操作を直接記述することもできます。たとえば、setThreshold() で閾値の設定、getTitle() でアクティブ画像の取得が記述できます。マクロ化の価値は、高速化だけではありません。手順と条件をテキストとして保存し、再現・共有できることにあります。"
    ],
    "points": [
     "run() で、400を超えるコマンドを実行できます",
     "Recorderが、手作業からコードを生成します",
     "手順と条件がテキストとして残り、再現性を担保します"
    ],
    "caution": "記録されたマクロには、その時点の画像名や条件が、固定値として含まれることがあります。別のデータへの適用前に、確認してください。",
    "src": "https://imagej.net/ij/developer/macro/functions.html",
    "srcName": "ImageJ公式「Macro Functions」リファレンス",
    "version": "現行の imagej.net 掲載リファレンスに基づく。マクロ言語の基本体系は1.46r時代から継続している。",
    "lessons": [
     "L14"
    ],
    "terms": [
     ".ijm / マクロファイル",
     "コマンドレコーダ"
    ]
   },
   {
    "id": "D10-2",
    "title": "setBatchMode：表示を止めて高速化する",
    "menu": "（マクロ関数 setBatchMode）",
    "body": [
     "setBatchMode(true) でバッチモードに入ると、マクロ実行中に画像が表示されなくなります。処理は大幅に高速化されます。バッチモードは、マクロ終了時に自動的に解除されます。",
     "ただし、表示されない状態では、視認による確認ができません。「どの画像が対象になっているか」を目で確かめられないのです。対象画像の指定ミスが、そのまま結果になります。そのため、バッチ化する前に、表示ありの状態で同じ手順を通し、結果を確認しておくことが前提になります。"
    ],
    "points": [
     "バッチモードは、表示を省略して高速化します",
     "終了時に自動で解除されます",
     "バッチ化の前に、表示ありで全手順を検証します"
    ],
    "caution": "過去資料には、高速化の倍率の記載もあります。しかし、倍率は環境や処理内容で変わります。数値を根拠に設計してはいけません。",
    "src": "https://imagej.net/ij/developer/macro/functions.html",
    "srcName": "ImageJ Macro Language 公式リファレンス（PDF）",
    "version": "公式マクロ言語リファレンスに基づく。高速化の具体的倍率はバージョン・環境依存のため本リファレンスでは数値を採用していない。",
    "lessons": [
     "L14",
     "L15"
    ],
    "terms": [
     "バッチ処理"
    ]
   },
   {
    "id": "D10-3",
    "title": "Batch Macro：出力フォルダを指定しないと自動保存されない",
    "menu": "Process > Batch > Macro...",
    "body": [
     "Process > Batch > Macro は、一連の流れを繰り返す仕組みです。入力フォルダ内の各画像を自動で開きます。指定したマクロを適用し、出力フォルダへ保存して閉じます。",
     "重要な注意点があります。出力（Output）フォルダを指定しない場合、バッチ機能による処理結果の自動保存は行われません。ただし、マクロの中に保存処理を明示的に書いた場合は、その限りではありません。「処理は回ったのに結果が残っていない」という事故は、この仕様によるものです。",
     "出力は、入力と別のフォルダを指定してください。同名の出力があると、上書きされることがあります。元画像のバックアップを残しておくことも大切です。本番適用の前に、少数枚の別フォルダで試して、結果を確認するのが安全です。"
    ],
    "points": [
     "入力→マクロ適用→出力へ保存→閉じる、の反復です",
     "Output未指定では、自動保存されません",
     "出力は入力と別フォルダにし、元画像を残します"
    ],
    "caution": "サブフォルダは、標準では再帰処理されません。階層構造のデータは、構成を確認してから適用してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/Batch_mode.html",
    "srcName": "ImageJ公式「Batch Mode / Batch Processing」解説",
    "version": "公式 Batch Processing 解説に基づく。自動保存の仕様は公式文書により確認済みである。",
    "lessons": [
     "L23"
    ],
    "terms": [
     "バッチマクロ（Process > Batch）",
     "バッチ処理"
    ]
   },
   {
    "id": "D10-4",
    "title": "コマンドライン実行と getArgument()：外部から条件を渡す",
    "menu": "（コマンドライン -macro / -batch オプション）",
    "body": [
     "ImageJは、コマンドラインの -macro / -batch オプションで、マクロを指定して起動できます。渡した文字列引数は、マクロ側で getArgument() により取得できます。これにより、対象フォルダや条件を外部から変えながら、同じマクロを繰り返し実行する運用が可能になります。",
     "人手の介在しない実行では、エラー時の見落としが起きやすいです。出力ファイル数や代表画像の結果など、実行後の機械的な確認項目を決めておくことが重要です。"
    ],
    "points": [
     "-macro / -batch で、無人実行ができます",
     "getArgument() で、外部の条件を受け取ります",
     "実行後は、出力件数などで機械的に確認します"
    ],
    "caution": "無人実行では、途中エラーが画面に残らない場合があります。ログや出力の確認を省略してはいけません。",
    "src": "https://imagej.net/ij/developer/macro/macros.html",
    "srcName": "ImageJ公式「Macros」解説",
    "version": "公式 Macros 解説に基づく。オプション体系は現行版でも継続している。",
    "lessons": [
     "L15"
    ],
    "terms": [
     "バッチ処理"
    ]
   }
  ]
 },
 {
  "id": "D11",
  "title": "プラグインと拡張",
  "intro": "ImageJの標準コマンド自体が、内部プラグインとして実装されています。拡張の仕組みは、本体と地続きです。この章では、プラグインの配置を説明します。Fijiの更新管理や、Bio-Formatsによる形式対応も整理します。",
  "entries": [
   {
    "id": "D11-1",
    "title": "プラグインの仕組み：pluginsフォルダに入れるとメニューに載る",
    "menu": "Plugins メニュー",
    "body": [
     "プラグインは、Java で書かれ .class にコンパイルされた拡張モジュールです。plugins フォルダ（サブフォルダを含む）へ配置すると、再起動後に Plugins メニューへ載ります。メニューへ載るためには、命名の条件があります。ファイル名にはアンダースコアを含むことなどです。",
     "ImageJの標準コマンドの多くも、ij.jar の内部にプラグインとして実装されています。「本体機能」と「プラグイン」の境界は、実装上は連続しています。そのため、バージョンや追加プラグインの違いが、そのまま使える機能の違いになります。"
    ],
    "points": [
     "Java製モジュールを、plugins フォルダへ配置します",
     "命名条件を満たすと、メニューに自動で載ります",
     "標準コマンドも、内部プラグインとして実装されています"
    ],
    "caution": "出典の不明なプラグインは、処理内容を検証できない限り、定量解析には使ってはいけません。バージョンを記録しておくことも重要です。",
    "src": "https://imagej.net/ij/docs/menus/plugins.html",
    "srcName": "ImageJ公式「Plugins Menu」解説",
    "version": "現行の imagej.net 掲載解説に基づく。命名条件は公式ページで確認した。",
    "lessons": [
     "L15"
    ],
    "terms": [
     "プラグイン",
     "ij.jar",
     "StartupMacros"
    ]
   },
   {
    "id": "D11-2",
    "title": "FijiのUpdaterと更新サイト：追加機能の入手と管理",
    "menu": "Help > Update...",
    "body": [
     "Fijiでは、ImageJ Updater が更新と入手を担います。更新サイト（Update Site）と呼ばれる配布元を登録・管理し、プラグイン一式の入手と更新を行います。Bio-Formats のような主要コンポーネントの更新も、Fijiでは Updater 経由が推奨される経路です。",
     "更新サイトを追加すると、そのサイトが配布するコマンドがメニューに加わります。利便性と引き換えに、環境ごとに機能構成が変わります。そのため、解析手順の共有時には、「どの更新サイトを有効にしているか」も条件の一部として記録すべきです。"
    ],
    "points": [
     "Updaterが、更新サイト単位でプラグインを管理します",
     "Bio-Formatsなどの更新も、FijiではUpdater経由です",
     "有効な更新サイトは、解析条件の一部です"
    ],
    "caution": "更新により、既存手順の挙動が変わることがあります。重要な解析の途中での一括更新は避けてください。更新後に、代表データで再検証することも必要です。",
    "src": "https://imagej.net/formats/bio-formats",
    "srcName": "imagej.net「Bio-Formats」解説",
    "version": "imagej.net の現行解説に基づく。Updater の仕組みはFijiの現行配布でも継続している。",
    "lessons": [
     "L15"
    ],
    "terms": [
     "ImageJ Updater",
     "更新サイト（Update Site）",
     "Bio-Formats"
    ]
   },
   {
    "id": "D11-3",
    "title": "Bio-Formats：メーカー形式とメタデータを読み込む",
    "menu": "File > Import > Bio-Formats...",
    "body": [
     "Bio-Formats は、多数のライフサイエンス画像形式を読み書きするための、ライブラリ／プラグイン群です。Bio-Formats Importer を使うと、各メーカー形式の画像と取得メタデータを読み込めます。OMEモデルに標準化した形で読み込めます。Fijiでは、File > Open 系の操作に統合されています。",
     "顕微鏡画像の画素サイズ・チャンネル構成・撮影条件といったメタデータは、空間校正や定量の前提になります。標準の開き方でこれらが欠落する形式では、Bio-Formats 経由の読み込みが、正確な解析の前提条件になります。"
    ],
    "points": [
     "多数のメーカー形式とメタデータに対応します",
     "メタデータは、OMEモデルに標準化されます",
     "校正情報の保持が、定量の前提になります"
    ],
    "caution": "読み込み時のオプション（チャンネルの統合・分割など）で、データの形が変わります。選択したオプションを記録してください。",
    "src": "https://imagej.net/formats/bio-formats",
    "srcName": "imagej.net「Bio-Formats」解説",
    "version": "imagej.net の現行解説に基づく。Fijiでは標準同梱コンポーネントとして提供される。",
    "lessons": [
     "L03",
     "L15"
    ],
    "terms": [
     "Bio-Formats",
     "TIFF"
    ]
   }
  ]
 },
 {
  "id": "D12",
  "title": "ファイル形式とメタデータ",
  "intro": "保存形式の選択は、データの保持範囲を決める行為です。この章では、TIFFが標準とされる理由を説明します。JPEGが定量に不向きな理由や、保存で失われる情報も整理します。",
  "entries": [
   {
    "id": "D12-1",
    "title": "TIFFがImageJの標準形式である理由",
    "menu": "File > Save As > Tiff...",
    "body": [
     "TIFFは、ImageJのデフォルト形式です。8/16/32-bitおよびRGBに対応し、スケール（空間校正）などのメタデータを保存できます。通常形式の中で、校正情報を保存できるのは、TIFF（およびZIP圧縮TIFF）に限られます。",
     "解析の途中経過や結果画像を保存する形式として、TIFFが標準になります。理由は、可逆であることと、測定の前提情報（校正）を一緒に保持できることです。"
    ],
    "points": [
     "8/16/32-bit・RGBに対応する、可逆形式です",
     "校正情報を保存できる通常形式は、TIFF/ZIPのみです",
     "解析データの保存は、TIFFを標準とします"
    ],
    "caution": "表示用に別形式へ書き出した場合、校正情報は失われます。提出用ファイルと解析用ファイルは、区別して管理してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行1.54系でもTIFFがデフォルトであり、校正の保存範囲は同一である。",
    "lessons": [
     "L03"
    ],
    "terms": [
     "TIFF",
     "Set Scale"
    ]
   },
   {
    "id": "D12-2",
    "title": "JPEGが定量解析に不向きな理由",
    "menu": "File > Save As > Jpeg...",
    "body": [
     "JPEGは、非可逆圧縮の形式です。保存のたびに、画素値が近似値へ書き換わります。ブロック境界のノイズ（アーティファクト）が生じ、元のグレー値は復元できません。ImageJがネイティブに扱える形式には、TIFF・GIF・JPEG・PNG・DICOM・BMP・PGM・FITSがあります。しかし、「開ける」ことと「定量に使える」ことは別です。",
     "観察記録や共有には問題なくても、注意が必要です。強度や面積を測る元データとして、JPEG保存された画像を使うべきではありません。取得段階で、可逆形式（TIFFなど）を選ぶことが前提になります。"
    ],
    "points": [
     "JPEGは非可逆で、画素値が変わります",
     "圧縮アーティファクトが、測定誤差になります",
     "元データは、可逆形式で取得・保存します"
    ],
    "caution": "JPEGで受け取った画像しかない場合、その制約を結果の解釈に明記してください。数値の厳密な比較はできない、という前提で扱います。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述。現行版でもJPEGの非可逆性は変わらない。",
    "lessons": [
     "L03"
    ],
    "terms": [
     "TIFF",
     "グレー値"
    ]
   },
   {
    "id": "D12-3",
    "title": "メタデータと校正情報：保存で保持されるもの・されないもの",
    "menu": "Image > Properties... / File > Save As",
    "body": [
     "ImageJ標準の保存では、保持されるメタデータの範囲は形式に依存します。代表的には、空間校正（スケール）はTIFF/ZIP形式でのみ保存されます。それ以外の通常形式では保持されません。",
     "また、表示に使っているLUTや表示範囲のような「見せ方」の情報と、測定の前提になる「校正」の情報は、性質が異なります。後者が失われると、同じ画像でも測定結果の単位が変わってしまいます。",
     "メタデータ保持についての記述は、「ImageJ標準の保存では」という留保のもとで理解すべきです。Bio-Formatsなどの拡張経由の保存では、範囲が異なり得ます。"
    ],
    "points": [
     "校正情報の保存は、TIFF/ZIPに限られます（標準保存）",
     "表示情報と校正情報は、性質が異なります",
     "拡張経由の保存では、保持範囲が変わり得ます"
    ],
    "caution": "形式変換のたびに、校正が保持されているか、Properties で確認してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r 時点の記述に基づき、「標準の保存では」の留保を付して収録した。",
    "lessons": [
     "L03",
     "L07"
    ],
    "terms": [
     "TIFF",
     "Set Scale",
     "LUT（ルックアップテーブル）"
    ]
   },
   {
    "id": "D12-4",
    "title": "保存形式の選択指針：解析用・共有用・提出用を分ける",
    "menu": "File > Save As",
    "body": [
     "形式選択の実務的な指針は、用途ごとにファイルを分けることです。解析用は、元のビット深度と校正を保持するTIFFです。共有・確認用は、相手が開ける形式です。提出用は、指定された形式です。このように役割ごとに書き分け、解析用を上書きしないようにします。",
     "特に、不可逆な操作は、解析用ファイルに対して行ってはいけません。型変換や表示範囲の Apply、JPEG保存のような操作です。これらが必要な場合は、コピーに対して行ってください。ファイル名やフォルダで区別します。"
    ],
    "points": [
     "用途別にファイルを書き分けます",
     "不可逆な操作は、コピーにだけ適用します",
     "解析用マスターは、常に保持します"
    ],
    "caution": "ファイル名が同じで中身の世代が違う状態は、取り違えの温床になります。命名規則で、世代と用途を区別してください。",
    "src": "https://imagej.github.io/imagej-wiki-static/User_Guide/Working_with_ImageJ.html",
    "srcName": "ImageJ User Guide「Working with ImageJ」",
    "version": "User Guide 1.46r の形式解説に基づく実務指針（独自まとめ）。現行版でも各形式の性質は同一である。",
    "lessons": [
     "L03"
    ],
    "terms": [
     "TIFF",
     "量子化"
    ]
   }
  ]
 }
];

window.IJDATA2.terms = [
 {
  "t": "アクティブ画像",
  "en": "Active Image",
  "aliases": [
   "アクティブイメージ",
   "前面の画像"
  ],
  "cat": "basics",
  "d": "一番手前に表示され、処理や計測など、すべての操作の対象になる画像ウィンドウです。",
  "detail": "ImageJの操作は、いつもアクティブな1枚だけに対して実行されます。複数の画像を開いているときは、タイトルバーの状態を見て対象を確認します。これが誤操作を防ぐ基本です。マクロでは getTitle() を使うと、対象を明示できます。",
  "vs": "開いているだけの非アクティブな画像は、操作の対象になりません。",
  "ex": "複製して処理する前に、元画像のウィンドウがアクティブかどうかを確認します。",
  "related": [],
  "src": "work"
 },
 {
  "t": "Undo",
  "en": "Undo",
  "aliases": [
   "取り消し",
   "アンドゥ"
  ],
  "cat": "basics",
  "d": "操作を取り消す機能です。ImageJでは、基本的に直近の画像編集やフィルタ操作だけが対象です。",
  "detail": "一般的なアプリケーションのように、履歴を何段階もさかのぼることはできません。元に戻せない処理をする前には、複製や中間保存をしておきます。それが実質的な「保険」になります。",
  "vs": "何段階も undo できる一般的な編集ソフトとは、仕様が異なります。",
  "ex": "フィルタを掛け過ぎた場合は、直前の1回分だけ取り消せます。",
  "related": [
   "アクティブ画像"
  ],
  "src": "work"
 },
 {
  "t": "Fiji",
  "en": "Fiji",
  "aliases": [
   "フィジー"
  ],
  "cat": "basics",
  "d": "ImageJを土台に、ライフサイエンス向けのプラグインを多数同梱した配布形態です。「Fiji Is Just ImageJ」の略です。",
  "detail": "本体の操作体系はImageJと共通です。違いは、同梱されるプラグインと、ImageJ Updater による更新管理にあります。手順を共有するときは、ImageJかFijiかという違いや、同梱プラグインの前提が結果に影響します。",
  "vs": "ImageJ本体そのものとは、プラグインの構成と更新方法が異なります。",
  "ex": "Bio-Formatsや各種解析プラグインが最初から使える配布形態として導入します。",
  "related": [
   "プラグイン",
   "ImageJ Updater",
   "Bio-Formats"
  ],
  "src": "work"
 },
 {
  "t": "疑似カラー画像",
  "en": "Pseudocolor Image",
  "aliases": [
   "擬似カラー",
   "シュードカラー"
  ],
  "cat": "basics",
  "d": "単一チャンネルのグレー画像に、LUTで色を割り当てた表示です。色の違いは、強度の違いを表します。",
  "detail": "色は表示のための符号化です。データ自体は単一チャンネルのままです。そのままRGBへ変換すると、チャンネルごとに分けた定量ができなくなります。",
  "vs": "RGB画像（3チャンネルの実データ）とは違い、色はLUTによる表示です。",
  "ex": "蛍光強度をカラースケールで可視化して、分布を確認します。",
  "related": [
   "LUT（ルックアップテーブル）",
   "RGB画像"
  ],
  "src": "work"
 },
 {
  "t": "コマンドレコーダ",
  "en": "Command Recorder",
  "aliases": [
   "レコーダ",
   "Recorder",
   "Macros > Record"
  ],
  "cat": "basics",
  "d": "Plugins > Macros > Record の機能です。GUIの操作を記録し、run() の呼び出しからなるマクロを生成します。",
  "detail": "自動化の起点になります。同時に、メニュー操作が内部コマンドのどれに対応するかを確認する、公式な手段でもあります。記録されたコードは、編集して再利用できます。",
  "vs": "手作業の手順メモとは違い、そのまま実行できるコードが得られます。",
  "ex": "閾値処理から粒子解析までの操作を記録して、バッチ処理用マクロの土台にします。",
  "related": [
   ".ijm / マクロファイル"
  ],
  "src": "plug"
 },
 {
  "t": "ピクセル",
  "en": "Pixel",
  "aliases": [
   "画素",
   "picture element"
  ],
  "cat": "basics",
  "d": "画像を構成する最小の要素です。強度（グレー値）を持ちます。画像は、ピクセルの2次元の格子として表されます。",
  "detail": "ピクセルは「値を持つ格子点」です。実空間での大きさは、空間校正（Set Scale）によって初めて決まります。ピクセルの数と実寸は、別の概念です。",
  "vs": "ボクセルは、スタックにおける3次元版の概念です。",
  "ex": "16-bit画像の各ピクセルは、0〜65,535の整数値を持ちます。",
  "related": [
   "グレー値",
   "ボクセル",
   "Set Scale"
  ],
  "src": "work"
 },
 {
  "t": "グレー値",
  "en": "Gray Value",
  "aliases": [
   "画素値",
   "ピクセル値",
   "輝度値",
   "gray level"
  ],
  "cat": "basics",
  "d": "各ピクセルが保持する数値です。検出信号を数値化したもので、それ自体は物理量ではありません。",
  "detail": "取得条件（露光・ゲイン・光源）が変われば、同じ対象でも値は変わります。そのため、比較が意味を持つのは条件をそろえた画像の間だけです。表示の明るさとは別物で、LUTや表示範囲を変えても値は変わりません。",
  "vs": "表示上の明るさ（表示範囲で変わります）や、校正後の物理量とは異なります。",
  "ex": "蛍光画像で対象領域のグレー値の平均を取り、背景と比較します。",
  "related": [
   "ピクセル",
   "Mean Gray Value",
   "ヒストグラム"
  ],
  "src": "work"
 },
 {
  "t": "8-bit画像",
  "en": "8-bit Image",
  "aliases": [
   "8ビット",
   "256階調"
  ],
  "cat": "types",
  "d": "256階調（0〜255の整数のみ）を表せる画像です。",
  "detail": "表示や互換性の面では扱いやすい画像です。ただし階調が粗く、取得データが16-bitの場合は、変換で情報が失われます。演算では、範囲外の結果が0や255に丸められます。",
  "vs": "16-bit画像と比べると階調が1/256で、ダイナミックレンジが狭いです。",
  "ex": "表示用や提出用への書き出し、二値化の前提として使います。",
  "related": [
   "16-bit画像",
   "量子化",
   "ダイナミックレンジ"
  ],
  "src": "work"
 },
 {
  "t": "16-bit画像",
  "en": "16-bit Image",
  "aliases": [
   "16ビット",
   "65536階調"
  ],
  "cat": "types",
  "d": "65,536階調（0〜65,535の整数のみ）を表せる画像です。符号なし整数として扱われます。",
  "detail": "顕微鏡の取得データで標準的な深度です。ヒストグラム表示では、最小から最大までの範囲を256ビンに分けて集計されます。8-bit化すると階調が潰れ、元には戻りません。",
  "vs": "8-bit画像より階調が細かいです。ただし、小数や負値を保持できない点は共通です。",
  "ex": "蛍光強度の定量は、取得した16-bitのまま行います。",
  "related": [
   "8-bit画像",
   "32-bit画像",
   "ビン（bin）"
  ],
  "src": "work"
 },
 {
  "t": "32-bit画像",
  "en": "32-bit Float Image",
  "aliases": [
   "32ビット",
   "float画像",
   "浮動小数画像"
  ],
  "cat": "types",
  "d": "浮動小数でピクセル値を表す画像です。値の範囲に制限がなく、NaNも入り得ます。",
  "detail": "演算の中間結果（差分や除算など）を、切り捨てずに保持するための型です。Image Calculator の 32-bit Result 指定は、この型で結果を返します。",
  "vs": "整数型とは違い、小数・負値・Infinity/NaNを保持できます。",
  "ex": "背景画像の引き算結果を負値ごと保持してから、評価します。",
  "related": [
   "Infinity / NaN",
   "Image Calculator"
  ],
  "src": "work"
 },
 {
  "t": "RGB画像",
  "en": "RGB Image",
  "aliases": [
   "RGBカラー",
   "24-bitカラー"
  ],
  "cat": "types",
  "d": "赤・緑・青の各チャンネルが256値を持つ24-bitカラー画像です（alpha付きは32-bitです）。",
  "detail": "表示のための表現であり、定量には向きません。チャンネル別に測る場合は、Split Channels でグレースケールへ分離します。ヒストグラムは、輝度へ変換した後の分布として表示されます。",
  "vs": "コンポジット画像とは違い、チャンネルを分離して保持しません。",
  "ex": "カラー写真の取り込みや、提出用の合成図の作成に使います。",
  "related": [
   "チャンネル",
   "コンポジット画像",
   "疑似カラー画像"
  ],
  "src": "work"
 },
 {
  "t": "チャンネル",
  "en": "Channel",
  "aliases": [
   "channel",
   "色チャンネル",
   "蛍光チャンネル"
  ],
  "cat": "types",
  "d": "画像を構成する独立した成分（赤・緑・青や、各蛍光色素）のデータ系列です。",
  "detail": "多重染色では、1色素＝1チャンネルが基本です。チャンネルごとにグレースケールとして定量します。コンポジット画像やハイパースタックの c 軸として保持されます。",
  "vs": "スライス（z方向の断層）やフレーム（t方向）とは、別の軸です。",
  "ex": "DAPIとGFPを別チャンネルとして分離し、それぞれ測定します。",
  "related": [
   "コンポジット画像",
   "Merge Channels",
   "ハイパースタック"
  ],
  "src": "color"
 },
 {
  "t": "TIFF",
  "en": "TIFF",
  "aliases": [
   "TIF",
   "Tagged Image File Format"
  ],
  "cat": "types",
  "d": "ImageJのデフォルト形式です。8/16/32-bitとRGBに対応します。スケールなどのメタデータを保存できる、唯一の通常形式です。",
  "detail": "可逆形式であり、空間校正を保持できます。そのため、解析データの保存の標準になります。表示用に他の形式へ書き出すと、校正は失われます。",
  "vs": "JPEG（非可逆で、校正を保持しません）とは、保存の性質が正反対に近いです。",
  "ex": "解析途中の画像と結果画像をTIFFで保存し、校正を維持します。",
  "related": [
   "Set Scale",
   "Bio-Formats"
  ],
  "src": "work"
 },
 {
  "t": "スタック",
  "en": "Stack",
  "aliases": [
   "stack",
   "画像スタック"
  ],
  "cat": "types",
  "d": "複数の画像（スライス）を1つのウィンドウにまとめたものです。すべてのスライスが、同じサイズ・同じビット深度である必要があります。",
  "detail": "Z方向の断層の列として扱うのが典型です。Z投影や Multi Measure など、スタック専用の処理や測定の対象になります。",
  "vs": "ハイパースタックは、スタックにチャンネルと時間の軸を加えた拡張です。",
  "ex": "共焦点顕微鏡のZシリーズを開いて、投影や測定をします。",
  "related": [
   "スライス",
   "ハイパースタック",
   "Z投影",
   "仮想スタック"
  ],
  "src": "work"
 },
 {
  "t": "スライス",
  "en": "Slice",
  "aliases": [
   "slice",
   "断層像"
  ],
  "cat": "types",
  "d": "スタックを構成する1枚の画像です。Z方向の位置に対応します。",
  "detail": "スタック内の位置は、スライス番号で表されます。Z投影の範囲指定や、Multi Measure の測定単位は、スライスを基準にします。",
  "vs": "チャンネル（c軸）やフレーム（t軸）とは、異なる軸の要素です。",
  "ex": "Z投影の開始・終了スライスを指定して、部分的に投影します。",
  "related": [
   "スタック",
   "ボクセル",
   "Z投影"
  ],
  "src": "work"
 },
 {
  "t": "ハイパースタック",
  "en": "Hyperstack",
  "aliases": [
   "hyperstack",
   "多次元スタック"
  ],
  "cat": "types",
  "d": "x, y, z（深さ）, c（チャンネル）, t（時間）の4D/5Dを扱う、スタックの拡張です。",
  "detail": "軸の割り当てを取り違えると、チャンネルと時間を混同した解析になります。読み込むときに、各軸の意味を確認することが前提です。",
  "vs": "通常のスタック（zのみ）に対して、cとtの軸が加わります。",
  "ex": "多色蛍光のタイムラプスデータを、5次元として開きます。",
  "related": [
   "スタック",
   "チャンネル",
   "コンポジット画像"
  ],
  "src": "work"
 },
 {
  "t": "仮想スタック",
  "en": "Virtual Stack",
  "aliases": [
   "virtual stack"
  ],
  "cat": "types",
  "d": "データをディスク上に置くスタックです。メモリに収まらない画像列を開けますが、読み取り専用です。",
  "detail": "大容量データの閲覧や確認には有効です。ただし、画素を書き換える処理は適用できません。処理が必要な部分は、通常のスタックとして読み込み直します。",
  "vs": "通常のスタックとは、メモリ常駐かディスク常駐かと、書き換えができるかが異なります。",
  "ex": "数千枚の連番画像を仮想スタックで開いて、対象の範囲を選びます。",
  "related": [
   "スタック"
  ],
  "src": "work"
 },
 {
  "t": "ボクセル",
  "en": "Voxel",
  "aliases": [
   "voxel",
   "体積要素"
  ],
  "cat": "types",
  "d": "スタックにおける、3次元格子上の強度値です。2D画像のピクセルに対応する概念です。",
  "detail": "実空間での大きさは、xy方向の画素サイズと z 間隔の校正で決まります。3次元で体積や距離を測るときは、z 間隔の校正が誤差の要因になります。",
  "vs": "ピクセルは2次元の格子要素、ボクセルは3次元の格子要素です。",
  "ex": "Zスタックの物体の体積を、ボクセルの数と校正値から算出します。",
  "related": [
   "ピクセル",
   "スタック",
   "Set Scale"
  ],
  "src": "work"
 },
 {
  "t": "コンポジット画像",
  "en": "Composite Image",
  "aliases": [
   "composite",
   "合成画像（チャンネル保持）"
  ],
  "cat": "types",
  "d": "チャンネルを分離したまま保持する画像です。各チャンネルは8/16/32-bitのどれでもよく、表示のオン/オフができます。",
  "detail": "Merge Channels で Create Composite を選ぶと生成されます。チャンネルが分離して保持されているため、チャンネル別の表示切替や、再分離・定量ができます。",
  "vs": "RGB画像とは違い、チャンネルが混ざっていません。",
  "ex": "3色蛍光をコンポジットで重ね、チャンネルを切り替えながら確認します。",
  "related": [
   "チャンネル",
   "Merge Channels",
   "RGB画像"
  ],
  "src": "color"
 },
 {
  "t": "量子化",
  "en": "Quantization",
  "aliases": [
   "quantization",
   "階調圧縮"
  ],
  "cat": "types",
  "d": "連続的で細かい階調の値を、粗い段階の値へ丸めることです。ビット深度を下げるときに起きます。",
  "detail": "16-bit→8-bit変換では、65,536階調が256階調へ圧縮されます。中間の差は、同じ値に潰れます。失われた階調は、深度を戻しても復元しません。",
  "vs": "表示範囲の変更（値は変わりません）とは違い、データそのものが失われます。",
  "ex": "暗部のわずかな強度差が、8-bit化で消える現象として現れます。",
  "related": [
   "8-bit画像",
   "16-bit画像",
   "ダイナミックレンジ"
  ],
  "src": "work"
 },
 {
  "t": "ダイナミックレンジ",
  "en": "Dynamic Range",
  "aliases": [
   "dynamic range",
   "DR",
   "階調範囲"
  ],
  "cat": "types",
  "d": "表現や検出ができる、最小の信号から最大の信号までの幅です。ビット深度と検出器の性能で決まります。",
  "detail": "8-bitでは最大256倍、16-bitでは最大65,536倍の比が、表現の上限になります。暗い対象と明るい対象が同居する画像では、この幅が不足すると、暗部が潰れるか明部が飽和します。",
  "vs": "ビット深度そのものとは違い、実際に使えている信号の幅を指す場合もあります。",
  "ex": "露光を決めるときに、飽和せず、暗部も潰れない範囲に収めます。",
  "related": [
   "飽和",
   "量子化",
   "16-bit画像"
  ],
  "src": "work"
 },
 {
  "t": "飽和",
  "en": "Saturation",
  "aliases": [
   "saturation",
   "サチュレーション",
   "白飛び"
  ],
  "cat": "types",
  "d": "信号が表現できる上限（8-bitなら255、16-bitなら65,535）に達し、それ以上の差が記録できなくなった状態です。",
  "detail": "飽和した領域の値は、すべて上限値に張り付きます。そのため、強度の比較も形状の評価もできません。取得時の露光やゲインの調整で避けるのが原則で、後処理では回復できません。整数演算で範囲外の結果が上限に丸められる現象も、同じ種類の問題です。",
  "vs": "単に「明るい」こととは違い、上限に張り付いて差が消えた状態を指します。",
  "ex": "蛍光が強すぎる条件では、核内が一様に最大値になり、定量できません。",
  "related": [
   "ダイナミックレンジ",
   "グレー値",
   "Math（Process > Math）"
  ],
  "src": "work"
 },
 {
  "t": "ROI",
  "en": "Region of Interest",
  "aliases": [
   "関心領域",
   "選択範囲",
   "region of interest"
  ],
  "cat": "roi",
  "d": "Region of Interest（関心領域）です。ツールで作る選択範囲で、計測や処理の対象を指定します。同時にアクティブなのは1つだけです。",
  "detail": "描いただけでは画像データは変わらない「指定」です。測定や処理は、この指定を参照して行われます。複数を扱う場合は、ROI Manager へ登録します。英語名の略称 ROI が、そのまま使われることが多いです。",
  "vs": "マスクは画素値で表されたデータです。オーバーレイは非破壊の重ね表示です。どちらもROIとは性質が異なります。",
  "ex": "細胞の輪郭をなぞってROIを作り、面積とMeanを測ります。",
  "related": [
   "ROI Manager",
   "マスク",
   "オーバーレイ"
  ],
  "src": "work"
 },
 {
  "t": "マスク",
  "en": "Mask",
  "aliases": [
   "mask",
   "マスク画像"
  ],
  "cat": "roi",
  "d": "対象と背景を画素値（多くは対象が255、背景が0）で表した、二値の画像データです。",
  "detail": "ROIが「指定」であるのに対し、マスクは保存や演算に使えるデータです。Convert to Mask で閾値設定から生成できます。Image Calculator の論理演算で、他の画像と組み合わせることもできます。",
  "vs": "ROI（一次的な指定）やオーバーレイ（表示）とは違い、画素値を持つ実データです。",
  "ex": "マスクとのAND演算で、対象領域だけを切り出して測定します。",
  "related": [
   "ROI",
   "Convert to Mask",
   "二値画像（バイナリ）",
   "AND演算（画像）"
  ],
  "src": "bin"
 },
 {
  "t": "ROI Manager",
  "en": "ROI Manager",
  "aliases": [
   "ROIマネージャ",
   "ROIマネージャー"
  ],
  "cat": "roi",
  "d": "Analyze > Tools > ROI Manager です。複数の選択を一覧で保持し、計測・描画・保存を行う道具です。",
  "detail": "Add（キー「t」）で、現在の選択を登録します。Measure で一括測定ができます。Save で .roi / ZIP 保存ができます。More > Multi Measure で、スタック全体の測定もできます。ROI運用の中核です。",
  "vs": "単一のアクティブな選択とは違い、複数のROIの集合を管理する仕組みです。",
  "ex": "対象のROIと背景のROIを登録し、まとめてMeasureして差し引きます。",
  "related": [
   "ROI",
   ".roiファイル / ROIセットZIP",
   "Multi Measure"
  ],
  "src": "tools"
 },
 {
  "t": ".roiファイル / ROIセットZIP",
  "en": ".roi File / ROI Set ZIP",
  "aliases": [
   "roiファイル",
   "ROIセット"
  ],
  "cat": "roi",
  "d": "ROI ManagerのSaveで作る保存形式です。単体は.roi、複数を一括で保存するとZIPアーカイブになります。Openで読み戻せます。",
  "detail": "画像と一緒に保管すると、別のセッションでも同じ選択の集合を再現できます。測定の再現性を担保できます。座標は、画像の左上を原点とする基準です。",
  "vs": "画像ファイルそのものとは違い、座標情報だけを保持します。",
  "ex": "解析に使ったROIセットを、結果データと一緒に保存します。",
  "related": [
   "ROI Manager",
   "ROI"
  ],
  "src": "tools"
 },
 {
  "t": "Restore Selection",
  "en": "Restore Selection",
  "aliases": [
   "選択の復元"
  ],
  "cat": "roi",
  "d": "消した選択を復元するコマンドです。別の画像へ選択を移すときにも使います。",
  "detail": "Edit > Selection にあります。元画像で作った選択を、処理後の画像へ同じ座標で移して測定する、といった使い方の基盤になります。",
  "vs": "ROI Managerからの読み戻しとは違い、直前の選択そのものを復元します。",
  "ex": "二値化した画像へ、元画像で作った選択を復元して重ねます。",
  "related": [
   "ROI",
   "ROI Manager"
  ],
  "src": "work"
 },
 {
  "t": "オーバーレイ",
  "en": "Overlay",
  "aliases": [
   "overlay",
   "重ね表示"
  ],
  "cat": "roi",
  "d": "画像の上に、非破壊で重ねて表示されるROIなどの要素です。アクティブな選択とは別に、複数を保持できます。",
  "detail": "画素値を一切変えずに、検出結果の輪郭や注釈を重ねて確認できます。スケールバーをオーバーレイとして描く使い方もあります。この場合は、元の画素が保持されます。",
  "vs": "マスク（画素データ）やアクティブなROI（単一の指定）とは、性質が異なります。",
  "ex": "粒子解析で検出した輪郭をオーバーレイ表示し、元画像と照合します。",
  "related": [
   "ROI",
   "マスク",
   "スケールバー"
  ],
  "src": "work"
 },
 {
  "t": "Multi Measure",
  "en": "Multi Measure",
  "aliases": [
   "マルチメジャー"
  ],
  "cat": "roi",
  "d": "ROI Managerの More にある機能です。スタックの全画像に対して全ROIを計測し、結果表を作ります。",
  "detail": "時間変化やZ方向の変化を、同じROI定義で追跡するための機能です。出力形式によって、行とROI・スライスの対応が変わります。本番の前に、小さいデータで確認するのが安全です。",
  "vs": "Measure（現在の1枚に対する測定）とは、対象の範囲が異なります。",
  "ex": "タイムラプスの全フレームの蛍光強度の推移を、一括で取得します。",
  "related": [
   "ROI Manager",
   "スタック",
   "Measure"
  ],
  "src": "tools"
 },
 {
  "t": "Set Scale",
  "en": "Set Scale",
  "aliases": [
   "空間校正",
   "スケール設定",
   "キャリブレーション"
  ],
  "cat": "measure",
  "d": "Analyzeメニューの空間校正ダイアログです。ピクセル数と既知の距離の対応を登録し、結果を実寸の単位にします。",
  "detail": "校正があるかどうかで、Areaや長さの結果の単位が、ピクセル基準か実寸基準かが決まります。Global設定では他の画像へ適用される場合があります。倍率の違う画像では、誤差の原因になります。校正情報は、TIFF/ZIP保存で保持されます。",
  "vs": "Set Measurements（記録項目の指定）とは、役割が異なります。",
  "ex": "スケールバーの実長を測って、µm 単位の校正を登録します。",
  "related": [
   "Area",
   "スケールバー",
   "TIFF"
  ],
  "src": "ana"
 },
 {
  "t": "Set Measurements",
  "en": "Set Measurements",
  "aliases": [
   "計測項目設定"
  ],
  "cat": "measure",
  "d": "Analyzeメニューのダイアログです。MeasureとAnalyze Particlesが記録する計測項目を指定します。",
  "detail": "指定されていない項目は、結果表に現れません。「測れない」のではなく「記録されない」仕様です。項目が無い場合は、まずここを確認します。一連の測定では、指定を統一することが比較可能性の前提になります。",
  "vs": "Set Scale（単位の校正）とは、役割が異なります。",
  "ex": "面積・Mean・面積率を、記録項目として事前に指定します。",
  "related": [
   "Measure",
   "Results表",
   "Mean Gray Value"
  ],
  "src": "ana"
 },
 {
  "t": "Measure",
  "en": "Measure",
  "aliases": [
   "計測",
   "測定"
  ],
  "cat": "measure",
  "d": "Analyze > Measure（キー「m」）です。アクティブな選択の計測結果を、Results表に1行追加します。",
  "detail": "記録される項目は Set Measurements の指定に従います。単位は Set Scale の校正に従います。選択がない場合は、画像全体が対象になります。",
  "vs": "Analyze Particles（オブジェクト単位の自動検出・計測）とは、対象の決め方が異なります。",
  "ex": "ROIを登録した後にMeasureし、結果表へ順に蓄積します。",
  "related": [
   "Set Measurements",
   "Results表",
   "ROI"
  ],
  "src": "ana"
 },
 {
  "t": "Results表",
  "en": "Results Table",
  "aliases": [
   "Results",
   "結果表",
   "リザルツ"
  ],
  "cat": "measure",
  "d": "Measureや粒子解析の結果が、1行ずつ貯まる表です。保存して、他のソフトで利用できます。",
  "detail": "行は、測定のたびに追加されます。列の構成は Set Measurements の指定に依存します。途中で指定を変えると、表の意味が変わります。保存して、表計算ソフトなどで集計するのが通常の流れです。",
  "vs": "Summary（粒子解析の集計行）とは役割が異なります。通常のResultsは、対象ごとの行を持ちます。",
  "ex": "全ROIの測定後にResultsを保存し、背景の引き算を表計算で行います。",
  "related": [
   "Measure",
   "Analyze Particles",
   "Set Measurements"
  ],
  "src": "ana"
 },
 {
  "t": "Analyze Particles",
  "en": "Analyze Particles",
  "aliases": [
   "粒子解析",
   "パーティクル解析"
  ],
  "cat": "measure",
  "d": "二値化や閾値処理をした画像のオブジェクトを走査して数え、それぞれを計測するコマンドです。Sizeの範囲外は無視されます。",
  "detail": "前提は二値化の品質です。閾値・Size・Circularity・端の扱いの各条件が、結果を全面的に決めます。Summarize を使うと、個数・合計面積・平均サイズ・面積率（%Area）が Summary に表示されます。",
  "vs": "Measure（手動で指定した選択の測定）とは、対象の検出を自動で行う点が異なります。",
  "ex": "閾値処理→Convert to Mask→粒子解析の流れで、細胞数を数えます。",
  "related": [
   "閾値処理（Threshold）",
   "Watershed",
   "Results表"
  ],
  "src": "ana"
 },
 {
  "t": "Mean Gray Value",
  "en": "Mean Gray Value",
  "aliases": [
   "平均グレー値",
   "Mean",
   "平均輝度"
  ],
  "cat": "measure",
  "d": "平均グレー値です。選択内のグレー値の合計を、ピクセル数で割った値です。",
  "detail": "蛍光画像では平均強度の指標として使われますが、総量ではありません。総量は、面積×平均（Integrated Density の考え方）で評価します。背景補正では、対象の Mean から背景の Mean を差し引きます。",
  "vs": "総蛍光量（面積×平均）や Mode（最頻値）とは、意味が異なります。",
  "ex": "対象のROIと背景のROIの Mean を測り、差し引いて補正済みの強度とします。",
  "related": [
   "グレー値",
   "Set Measurements",
   "ROI Manager"
  ],
  "src": "ana"
 },
 {
  "t": "Area",
  "en": "Area",
  "aliases": [
   "面積"
  ],
  "cat": "measure",
  "d": "選択の面積です。Set Scaleで校正済みなら、平方ミリメートルなどの校正単位で報告されます。",
  "detail": "未校正では、ピクセル数（pixel^2）としての値になります。単位の取り違えは、測定単位がおかしい場合の第一の確認点です。",
  "vs": "Area Fraction（面積率、割合）とは違い、Areaは絶対量です。",
  "ex": "校正済みの画像で、細胞の面積を µm^2 で報告します。",
  "related": [
   "Set Scale",
   "Set Measurements"
  ],
  "src": "ana"
 },
 {
  "t": "SNR",
  "en": "Signal-to-Noise Ratio",
  "aliases": [
   "信号対ノイズ比",
   "SN比",
   "S/N"
  ],
  "cat": "measure",
  "d": "信号の大きさとノイズの大きさの比です。画像の「測れる度合い」を表す基本指標です。",
  "detail": "SNRが低い画像では、平滑化で見た目を整えても、情報自体は増えません。背景のばらつき（標準偏差）に対する対象信号の比として見積もるのが、実務的な捉え方です。取得段階（露光・ゲイン）の設計が、SNRを決めます。",
  "vs": "単なる明るさやコントラスト（表示で変えられます）とは違い、データの質の指標です。",
  "ex": "露光条件の異なる画像同士で、定量の信頼度を比べる際の物差しにします。",
  "related": [
   "グレー値",
   "Gaussian Blur",
   "飽和"
  ],
  "src": "work"
 },
 {
  "t": "閾値処理（Threshold）",
  "en": "Threshold",
  "aliases": [
   "しきい値処理",
   "スレッショルド",
   "閾値",
   "thresholding"
  ],
  "cat": "threshold",
  "d": "強度の範囲を指定して、対象ピクセルと背景を分ける処理です。Image > Adjust > Threshold で行います。",
  "detail": "閾値の指定自体は、画素値を変えません。「分ける基準の設定」です。実際に白黒へ変換するのは、Apply や二値化のコマンドです。「しきい値」とも書かれ、英語では threshold です。自動手法（Otsu等）もここで選びます。",
  "vs": "二値化（Convert to Mask等、画素値を書き換える変換）とは、段階が異なります。",
  "ex": "対象が赤く表示される範囲に閾値を合わせ、粒子解析の前提を作ります。",
  "related": [
   "Convert to Mask",
   "Make Binary",
   "Otsu法",
   "二値画像（バイナリ）"
  ],
  "src": "bin"
 },
 {
  "t": "Otsu法",
  "en": "Otsu's Method",
  "aliases": [
   "大津の方法",
   "Otsu"
  ],
  "cat": "threshold",
  "d": "自動閾値の一手法です。クラス内分散が最小（クラス間分散が最大）になる閾値を選びます。二峰性ヒストグラムに向きます。",
  "detail": "対象と背景のピークが分かれたヒストグラムで、有効に働きます。対象が極端に小さい場合や、背景が不均一な場合は、前提が崩れて適切な閾値になりません。手法名は、結果の条件として記録すべきです。",
  "vs": "他の自動手法（Triangle、Li等）とは、最適化の前提が異なります。",
  "ex": "二峰性の明瞭な蛍光画像で、自動閾値の第一候補として使います。",
  "related": [
   "閾値処理（Threshold）",
   "ヒストグラム"
  ],
  "src": "bin"
 },
 {
  "t": "Make Binary",
  "en": "Make Binary",
  "aliases": [
   "メイクバイナリ"
  ],
  "cat": "threshold",
  "d": "Process > Binary のコマンドです。閾値が設定されていればそれを使います。未設定なら自動で決めて、白黒画像へ変換します。",
  "detail": "閾値の決定方法は Convert to Mask と共通です（設定済みならその閾値、未設定なら自動決定）。スタックでは、表示中のスライスの閾値が全スライスへ適用されます（imagejdocu の Binary 解説で確認）。",
  "vs": "Convert to Mask との違いは閾値の決め方ではありません。主に、結果の形式（マスクとして扱うかどうか）にあります。",
  "ex": "閾値を自分で決めずに、一括で二値画像化したい場合に使います。",
  "related": [
   "Convert to Mask",
   "閾値処理（Threshold）"
  ],
  "src": "bin"
 },
 {
  "t": "Convert to Mask",
  "en": "Convert to Mask",
  "aliases": [
   "マスクへ変換",
   "コンバートトゥマスク"
  ],
  "cat": "threshold",
  "d": "Process > Binary のコマンドです。現在の閾値設定に基づいて、白黒のマスク画像へ変換します（閾値が未設定なら自動で決めます）。",
  "detail": "実行した時点で、画素値が0と255へ書き換わります。そのため、元画像を残すには複製してから実行します。閾値の扱い（設定済みならその閾値、未設定なら自動決定）は、Make Binary と共通です。",
  "vs": "Make Binary とは閾値の決め方が共通で、違いは主に結果の形式にあります。Threshold（基準の設定のみ）とは、段階が異なります。",
  "ex": "閾値を目視で詰めたうえでマスク化し、粒子解析へ渡します。",
  "related": [
   "閾値処理（Threshold）",
   "Make Binary",
   "マスク",
   "Black Background"
  ],
  "src": "bin"
 },
 {
  "t": "Black Background",
  "en": "Black Background",
  "aliases": [
   "ブラックバックグラウンド"
  ],
  "cat": "threshold",
  "d": "Process > Binary > Options の設定です。二値画像の作られ方と解釈（どちらが対象か）を決めます。",
  "detail": "二値化の後に「対象と背景のどちらとして数えるか」に影響します。Threshold ウィンドウ側の Dark Background（暗い背景の解釈指定）とは、所在も意味も別の設定です。取り違えると、結果が全面的に反転します。",
  "vs": "Dark Background（Thresholdウィンドウの設定）とは別物です。名前の類似が、混同の原因になります。",
  "ex": "白地に黒い対象の画像を二値化する際に、解釈を確認します。",
  "related": [
   "Convert to Mask",
   "二値画像（バイナリ）"
  ],
  "src": "bin"
 },
 {
  "t": "二値画像（バイナリ）",
  "en": "Binary Image",
  "aliases": [
   "バイナリ画像",
   "二値化画像",
   "binary"
  ],
  "cat": "threshold",
  "d": "ピクセルが対象と背景の2値だけからなる画像です。値としては、0と255で表されることが多いです。",
  "detail": "粒子解析や形態学処理の入力になります。中間調を持たないため、強度の情報は保持しません。「二値化した画像で強度を測る」ことはできません。",
  "vs": "グレースケール画像（階調を持ちます）とは、情報の種類が異なります。",
  "ex": "マスクとして保存し、面積率や個数の計測に使います。",
  "related": [
   "Convert to Mask",
   "モルフォロジー演算",
   "Analyze Particles"
  ],
  "src": "bin"
 },
 {
  "t": "Watershed",
  "en": "Watershed",
  "aliases": [
   "ウォーターシェッド",
   "流域分割",
   "分水嶺アルゴリズム"
  ],
  "cat": "threshold",
  "d": "距離マップとその極大点をもとに、接触した粒子同士を分離する処理です。Process > Binary > Watershed です。",
  "detail": "滑らかで凸形状に近く、重なりの少ない粒子に向きます。凹凸の多い対象や、大きく重なった対象では、過分割や誤切断が原理的に起きます。分離の結果は、元画像との照合が必須です。",
  "vs": "閾値処理（対象と背景の分離）とは違い、対象同士の分離を行う処理です。",
  "ex": "軽く接触した細胞同士を分離してから、個数を数えます。",
  "related": [
   "距離マップ",
   "Analyze Particles",
   "二値画像（バイナリ）"
  ],
  "src": "bin"
 },
 {
  "t": "距離マップ",
  "en": "Distance Map",
  "aliases": [
   "距離画像",
   "EDM",
   "ユークリッド距離マップ"
  ],
  "cat": "threshold",
  "d": "二値画像の各対象ピクセルについて、最も近い背景ピクセルまでの距離を値として持つ画像です。",
  "detail": "対象の「太さ」の分布を表し、Watershed 分離の土台になります。極大点が対象の中心部に対応します。1つの対象に複数の極大点が現れる形状では、過分割の原因になります。",
  "vs": "元の二値画像（対象か否か）とは違い、距離という連続量を持つ画像です。",
  "ex": "Watershed の分離位置が妥当かどうかを、距離マップの形状から判断します。",
  "related": [
   "Watershed",
   "二値画像（バイナリ）"
  ],
  "src": "bin"
 },
 {
  "t": "モルフォロジー演算",
  "en": "Morphological Operations",
  "aliases": [
   "形態学処理",
   "形態学演算",
   "morphology"
  ],
  "cat": "threshold",
  "d": "二値画像の形状に対する演算の総称です。Erode（侵食）、Dilate（膨張）、Open、Close などがあります。",
  "detail": "Open（侵食→膨張）は、小さなノイズ対象の除去に使います。Close（膨張→侵食）は、穴や切れ目の補填に使います。いずれも形状、つまり測定対象そのものを変えます。そのため、適用は測定条件として記録する必要があります。",
  "vs": "フィルタ（グレースケールの近傍演算）とは違い、形状そのものを操作します。",
  "ex": "二値化後の小さなゴミを Open で取り除いてから数えます。",
  "related": [
   "二値画像（バイナリ）",
   "Watershed"
  ],
  "src": "bin"
 },
 {
  "t": "Gaussian Blur",
  "en": "Gaussian Blur",
  "aliases": [
   "ガウスぼかし",
   "ガウシアンブラー"
  ],
  "cat": "filter",
  "d": "Process > Filters の平滑化フィルタです。ガウス関数との畳み込みでぼかします。Sigmaは、ガウス関数の標準偏差σです。",
  "detail": "重み付き平均による平滑化で、σが大きいほど強くぼけます。ノイズは減りますが、エッジの鈍化とピーク値の低下を伴い、定量値が変わります。Unsharp Mask や背景推定の内部処理としても使われる考え方です。",
  "vs": "Medianフィルタ（中央値）とは置換の方法が異なり、外れ値の影響を受けやすいです。",
  "ex": "閾値処理の前に弱く掛けてノイズを抑えます（条件は記録します）。",
  "related": [
   "Medianフィルタ",
   "Unsharp Mask",
   "Meanフィルタ"
  ],
  "src": "proc"
 },
 {
  "t": "Medianフィルタ",
  "en": "Median Filter",
  "aliases": [
   "メディアンフィルタ",
   "中央値フィルタ"
  ],
  "cat": "filter",
  "d": "各ピクセルを近傍の中央値で置き換えるフィルタです。飛び値ノイズの除去に向きます。",
  "detail": "平均系と違い、外れ値の影響を受けにくく、エッジの保存性も高いです。Radius を大きくすると、細い線状の構造が消える副作用があります。",
  "vs": "Gaussian Blur（重み付き平均）とは、原理とノイズへの特性が異なります。",
  "ex": "塩胡椒状の孤立ノイズを除去してから解析します。",
  "related": [
   "Gaussian Blur",
   "Meanフィルタ"
  ],
  "src": "filt"
 },
 {
  "t": "Unsharp Mask",
  "en": "Unsharp Mask",
  "aliases": [
   "アンシャープマスク",
   "鮮鋭化"
  ],
  "cat": "filter",
  "d": "ぼかしたコピーを差し引いて、エッジを強調するフィルタです。Radiusはぼかしのσ、Mask Weightは強さです。",
  "detail": "Mask Weight を大きくしすぎると、エッジの周囲にハロー（過強調の縁）が現れます。ピーク値も跳ね上がります。観察用には有用ですが、強調後の画像は強度の定量に使えません。",
  "vs": "Sharpen（3×3の重み付き平均による強調）とは、処理もパラメータも異なります。",
  "ex": "論文図版の見栄えを整える、表示用のコピーにのみ適用します。",
  "related": [
   "Gaussian Blur",
   "Sharpen"
  ],
  "src": "proc"
 },
 {
  "t": "Meanフィルタ",
  "en": "Mean Filter",
  "aliases": [
   "平均フィルタ",
   "ミーンフィルタ"
  ],
  "cat": "filter",
  "d": "各ピクセルを近傍の平均で置き換える平滑化フィルタです。近傍の大きさはRadiusで指定します。",
  "detail": "最も単純な平滑化で、エッジも一様に鈍ります。3×3固定の Smooth とは、近傍の大きさが異なります。",
  "vs": "Smooth（3×3固定）や Gaussian Blur（重み付き）とは、近傍の扱いが異なります。",
  "ex": "弱い平滑化で、全体の粒状感を抑えます。",
  "related": [
   "Smooth",
   "Gaussian Blur",
   "Medianフィルタ"
  ],
  "src": "filt"
 },
 {
  "t": "Smooth",
  "en": "Smooth",
  "aliases": [
   "スムーズ"
  ],
  "cat": "filter",
  "d": "Processメニューの平滑化です。各ピクセルを3×3近傍の平均で置き換えます。",
  "detail": "パラメータを持たない簡易な平滑化です。繰り返し適用すると、徐々に強くぼけます。条件を細かく管理したい場合は、Gaussian Blur などを使います。",
  "vs": "Meanフィルタとは、近傍サイズの指定方法が異なります。",
  "ex": "軽いノイズ低減を、手早く行います。",
  "related": [
   "Meanフィルタ",
   "Gaussian Blur"
  ],
  "src": "proc"
 },
 {
  "t": "Sharpen",
  "en": "Sharpen",
  "aliases": [
   "シャープ化"
  ],
  "cat": "filter",
  "d": "Processメニューの強調フィルタです。3×3の重み付き平均で、コントラストとディテールを強調します（ノイズも強調し得ます）。",
  "detail": "パラメータを持たない強調です。ノイズの多い画像では、ノイズも際立ちます。強さの調整が必要な場合は、Unsharp Mask を使います。",
  "vs": "Unsharp Mask（ぼかし差し引き＋パラメータ調整）とは、方式が異なります。",
  "ex": "観察用の画像で、輪郭を際立たせます。",
  "related": [
   "Unsharp Mask",
   "Find Edges"
  ],
  "src": "proc"
 },
 {
  "t": "Find Edges",
  "en": "Find Edges",
  "aliases": [
   "エッジ検出",
   "ファインドエッジ"
  ],
  "cat": "filter",
  "d": "Processメニューのエッジ検出です。Sobel演算子で、強度の急変部を際立たせます。",
  "detail": "輪郭の抽出や、形状の確認に使う、可視化系の処理です。出力はエッジの強さの画像であり、元の強度情報は保持しません。",
  "vs": "平滑化フィルタ（変動を抑えます）とは、逆方向の処理です。",
  "ex": "対象の輪郭形状を、目視で確認します。",
  "related": [
   "Sharpen"
  ],
  "src": "proc"
 },
 {
  "t": "PSF",
  "en": "Point Spread Function",
  "aliases": [
   "点像分布関数",
   "点広がり関数",
   "point spread function"
  ],
  "cat": "filter",
  "d": "点光源が光学系を通して、画像上でどのように広がって写るかを表す分布です。像のぼけの性質を決めます。",
  "detail": "実際の像は、対象とPSFの畳み込みとして表されます。したがって顕微鏡像の「ぼけ」は、対象の性質ではなく光学系の応答です。近接した対象同士は、PSFの広がりの範囲では分離できなくなります。",
  "vs": "ピクセルサイズ（サンプリング間隔）とは別の、光学側の分解能の要因です。",
  "ex": "2つの蛍光点が分離できない場合に、PSFの広がりを原因として検討します。",
  "related": [
   "デコンボリューション",
   "Gaussian Blur"
  ],
  "src": "work"
 },
 {
  "t": "デコンボリューション",
  "en": "Deconvolution",
  "aliases": [
   "deconvolution",
   "逆畳み込み"
  ],
  "cat": "filter",
  "d": "PSFによるぼけ（畳み込み）を逆方向に補正し、像の鮮明さと定量性を回復しようとする処理です。",
  "detail": "PSFを正確に把握することが前提です。不適切な適用は、リンギングなどの人工的な構造を生みます。ImageJ/Fijiでは専用プラグインを用いる領域です。標準フィルタによる「鮮鋭化」とは、目的も原理も異なります。",
  "vs": "Unsharp Mask（見た目のエッジ強調）とは違い、光学応答の逆補正を目的とします。",
  "ex": "共焦点・ワイドフィールド像のぼけを、測定したPSFを用いて補正します。",
  "related": [
   "PSF",
   "Unsharp Mask"
  ],
  "src": "work"
 },
 {
  "t": "ヒストグラム",
  "en": "Histogram",
  "aliases": [
   "histogram",
   "度数分布"
  ],
  "cat": "hist",
  "d": "グレー値ごとのピクセル数の分布です。横軸がグレー値、縦軸がピクセル数です。Count/Mean/Modeなども表示されます。",
  "detail": "分布の形から、飽和の有無（端への張り付き）、背景ピークの位置、対象と背景の分離のしやすさを読み取ります。RGB画像では輝度変換後の分布として、16-bit画像では256ビンへの集計として表示されます。",
  "vs": "測定結果そのものとは違い、分布の可視化です。",
  "ex": "飽和しているかどうかを、上限側のピークで確認します。",
  "related": [
   "ビン（bin）",
   "Mode（最頻値）",
   "Brightness/Contrast"
  ],
  "src": "hist"
 },
 {
  "t": "LUT（ルックアップテーブル）",
  "en": "Lookup Table (LUT)",
  "aliases": [
   "LUT",
   "ルックアップテーブル",
   "カラーテーブル"
  ],
  "cat": "hist",
  "d": "グレー値と表示色（赤・緑・青の値）の対応表です。疑似カラー表示の土台になります。",
  "detail": "LUTの変更は表示だけを変えます。画素値と測定結果には影響しません。表示の見た目とデータの区別をつけるための、基本概念です。",
  "vs": "画素値そのものや、Brightness/Contrast（表示範囲の指定）とは異なる仕組みです。",
  "ex": "グレースケール表示を疑似カラー表示に切り替えて、分布を見やすくします。",
  "related": [
   "疑似カラー画像",
   "Brightness/Contrast"
  ],
  "src": "work"
 },
 {
  "t": "Mode（最頻値）",
  "en": "Mode",
  "aliases": [
   "モード",
   "最頻値"
  ],
  "cat": "hist",
  "d": "選択内で最も頻繁に現れるグレー値です。ヒストグラムの最も高いピークに対応します。",
  "detail": "多くの画像では、背景のグレー値が Mode になります。背景レベルの目安として使えます。ただし、対象が画面の大半を占める画像では、背景を表しません。",
  "vs": "Mean（平均）とは違い、最も多い値を指します。",
  "ex": "背景の代表値を、ざっくり把握します。",
  "related": [
   "ヒストグラム",
   "Mean Gray Value"
  ],
  "src": "ana"
 },
 {
  "t": "Brightness/Contrast",
  "en": "Brightness/Contrast",
  "aliases": [
   "明るさ/コントラスト",
   "B&C",
   "表示範囲"
  ],
  "cat": "hist",
  "d": "Image > Adjust の表示範囲調整です。ヒストグラムを見ながら、表示の明暗の範囲を変えるための道具です。",
  "detail": "通常の調整は表示だけを変え、画素値は変わりません。Apply で反映させた場合に限り値が書き換わり、範囲外の階調が失われます。",
  "vs": "Gamma補正（画素値への非線形変換）とは違い、原則として表示のみの調整です。",
  "ex": "暗い画像を、データを変えずに見やすい表示にします。",
  "related": [
   "ヒストグラム",
   "LUT（ルックアップテーブル）",
   "Gamma"
  ],
  "src": "hist"
 },
 {
  "t": "ビン（bin）",
  "en": "Bin",
  "aliases": [
   "bin",
   "階級",
   "区間"
  ],
  "cat": "hist",
  "d": "ヒストグラムの集計区間です。16-bit画像では、最小から最大までの範囲を256ビンに分けて集計します。",
  "detail": "16-bitのヒストグラム表示は、65,536階調をそのままではなく、256区間に丸めた概観です。細部の分布を見る目的には向かない点に注意します。",
  "vs": "階調そのもの（65,536段階）とは違い、表示上の集計単位です。",
  "ex": "16-bit画像のヒストグラムの粗さの理由を理解します。",
  "related": [
   "ヒストグラム",
   "16-bit画像"
  ],
  "src": "hist"
 },
 {
  "t": "Image Calculator",
  "en": "Image Calculator",
  "aliases": [
   "画像計算機",
   "イメージカルキュレータ"
  ],
  "cat": "calc",
  "d": "Processメニューのコマンドです。2枚の画像の間で、算術・論理演算を行います。32-bit Result指定で、浮動小数化してから演算します。",
  "detail": "演算子は、加減乗除やAND/ORなど13種あります。差分・背景引き算・マスク適用の基盤になります。位置の対応した画像同士で使うことが前提です。",
  "vs": "Math（定数との演算）とは違い、画像同士の演算を行います。",
  "ex": "原画像から背景画像をSubtractして、ムラを除きます。",
  "related": [
   "Math（Process > Math）",
   "AND演算（画像）",
   "背景差し引き",
   "32-bit画像"
  ],
  "src": "calc"
 },
 {
  "t": "Math（Process > Math）",
  "en": "Math",
  "aliases": [
   "数学演算",
   "定数演算"
  ],
  "cat": "calc",
  "d": "各ピクセルに定数を加減乗除などするコマンド群です。8-bitでは、結果は0〜255に丸められます。",
  "detail": "Add、Subtract、Multiply、Divide、Gamma などのサブコマンドを持ちます。整数型では範囲外が飽和します。そのため、演算の前に32-bit化が必要かどうかを判断することが重要です。",
  "vs": "Image Calculator（画像同士）とは、演算の相手が異なります。",
  "ex": "全体のオフセットを引いて、基準をそろえます。",
  "related": [
   "Image Calculator",
   "Gamma",
   "飽和"
  ],
  "src": "math"
 },
 {
  "t": "Gamma",
  "en": "Gamma",
  "aliases": [
   "ガンマ補正",
   "ガンマ値"
  ],
  "cat": "calc",
  "d": "Mathのガンマ補正です。8-bitでは f(p)=(p/255)^gamma×255 で、gammaの範囲は0.05〜5.0です。16-bitでは、最小値・最大値でスケーリングします。",
  "detail": "非線形の階調変換であり、強度の比例関係を崩します。同じ gamma でも、画像の値域で結果の対応が違います（特に16-bit）。表示調整用であり、補正後の画像は定量に使えません。",
  "vs": "Brightness/Contrast（表示のみ）とは違い、画素値を書き換える変換です。",
  "ex": "表示用コピーの中間調を持ち上げます。",
  "related": [
   "Math（Process > Math）",
   "Brightness/Contrast"
  ],
  "src": "math"
 },
 {
  "t": "Infinity / NaN",
  "en": "Infinity / NaN",
  "aliases": [
   "無限大",
   "非数",
   "Inf"
  ],
  "cat": "calc",
  "d": "32-bit浮動小数の特殊な値です。ゼロ除算ではInfinity、0÷0ではNaNになります。",
  "detail": "標準設定では、画像演算のゼロ除算はこの形で結果に現れます。NaNを含む領域の統計は、その影響を受けます。そのため、除算系の演算の後は値の点検が必要です。",
  "vs": "整数型では現れません。範囲外は、上限・下限へ丸められる点が異なります。",
  "ex": "背景がゼロの領域で除算した結果を点検します。",
  "related": [
   "32-bit画像",
   "Image Calculator"
  ],
  "src": "calc"
 },
 {
  "t": "背景差し引き",
  "en": "Background Subtraction (manual)",
  "aliases": [
   "背景引き算",
   "バックグラウンド差し引き"
  ],
  "cat": "calc",
  "d": "原画像から、背景とみなす画像（ぼかした版など）をSubtractで引く、処理の組み立て方です。",
  "detail": "Image Calculator の Subtract で自前で組む方法と、専用の Subtract Background コマンドを使う方法があります。どちらも「引く量の推定方法」が結果を決めます。",
  "vs": "Subtract Background（ローリングボールで背景を推定する専用コマンド）とは、推定の方法が異なります。",
  "ex": "別途用意した背景画像を引いて、照明ムラを除きます。",
  "related": [
   "Subtract Background",
   "Image Calculator"
  ],
  "src": "calc"
 },
 {
  "t": "AND演算（画像）",
  "en": "AND Operation",
  "aliases": [
   "AND",
   "論理積"
  ],
  "cat": "calc",
  "d": "Image Calculatorの論理演算の1つです。2画像のビット単位のANDを取り、マスクの共通部分の抽出などに使います。",
  "detail": "マスクとの組み合わせで「対象領域だけを残す」処理の基盤になります。グレースケール同士ではビット単位の演算になります。そのため、意図した結果かどうかを、小さな例で確認してから使います。",
  "vs": "算術演算（Add/Subtractなど）とは性質が異なる、論理演算です。",
  "ex": "2つのマスクの共通部分を抽出します。",
  "related": [
   "Image Calculator",
   "マスク"
  ],
  "src": "calc"
 },
 {
  "t": ".ijm / マクロファイル",
  "en": "Macro File (.ijm)",
  "aliases": [
   "ijm",
   "マクロファイル"
  ],
  "cat": "macro",
  "d": "ImageJマクロを保存するテキストファイルです。Plugins > Macros から実行・インストールできます。",
  "detail": "テキストであるため、条件の差分管理や共有が容易です。手順の再現性を担保する成果物として、画像や結果と一緒に保管します。",
  "vs": "プラグイン（Java/.class）とは違い、コンパイル不要のテキストです。",
  "ex": "確定した解析手順を .ijm として版管理します。",
  "related": [
   "コマンドレコーダ",
   "プラグイン"
  ],
  "src": "plug"
 },
 {
  "t": "バッチ処理",
  "en": "Batch Processing",
  "aliases": [
   "一括処理",
   "batch processing"
  ],
  "cat": "macro",
  "d": "フォルダ内の多数の画像に、同じ処理（マクロなど）を一括で適用し、出力フォルダへ保存する運用です。",
  "detail": "人手の介在を減らし、条件の統一を保証する運用形態です。代表的な実装が Process > Batch > Macro です。出力先の指定が、保存の前提になります。",
  "vs": "バッチモード（setBatchMode、表示の省略）とは別の概念です。",
  "ex": "実験の全画像に、同じ背景補正と測定を適用します。",
  "related": [
   "バッチマクロ（Process > Batch）"
  ],
  "src": "plug"
 },
 {
  "t": "プラグイン",
  "en": "Plugin",
  "aliases": [
   "plugin",
   "拡張モジュール"
  ],
  "cat": "plugin",
  "d": "Javaで書かれ、.class にコンパイルされた拡張モジュールです。pluginsフォルダに入れると、メニューに載ります。",
  "detail": "ファイル名のアンダースコアなど、メニューに載るための命名条件があります。標準コマンドの多くも、ij.jar 内の内部プラグインとして実装されています。本体と拡張の境界は連続しています。",
  "vs": "マクロ（テキスト/.ijm）とは、実装言語と配布形式が異なります。",
  "ex": "専用の解析機能をpluginsフォルダへ追加して使います。",
  "related": [
   "ij.jar",
   ".ijm / マクロファイル",
   "ImageJ Updater"
  ],
  "src": "plug"
 },
 {
  "t": "ij.jar",
  "en": "ij.jar",
  "aliases": [
   "ImageJ本体",
   "本体JAR"
  ],
  "cat": "plugin",
  "d": "ImageJ本体のJARファイルです。標準コマンドの多くが、内部プラグインとしてここに実装されています。",
  "detail": "本体のバージョンは、ij.jar の版に対応します。動作の差異を調べる際は、ImageJのバージョン表記と対応づけて記録することが重要です。",
  "vs": "外部プラグイン（pluginsフォルダ側）とは、配置場所が異なります。",
  "ex": "バージョン起因の挙動の差を切り分ける際の、確認対象になります。",
  "related": [
   "プラグイン"
  ],
  "src": "plug"
 },
 {
  "t": "Bio-Formats",
  "en": "Bio-Formats",
  "aliases": [
   "バイオフォーマッツ",
   "BioFormats"
  ],
  "cat": "plugin",
  "d": "多数のライフサイエンス形式を読み書きする、ライブラリ/プラグイン群です。ImporterでメタデータをOMEモデルに標準化します。",
  "detail": "メーカー形式の画像と取得メタデータ（画素サイズ、チャンネル構成など）を正しく読み込むための基盤です。Fijiでは File > Open に統合されています。更新は ImageJ Updater を使うことが推奨されます。",
  "vs": "ImageJ標準の読み込み（ネイティブ形式のみ）とは、対応範囲が異なります。",
  "ex": "顕微鏡メーカー形式を、メタデータごと開きます。",
  "related": [
   "ImageJ Updater",
   "TIFF"
  ],
  "src": "bio"
 },
 {
  "t": "ImageJ Updater",
  "en": "ImageJ Updater",
  "aliases": [
   "アップデータ",
   "Updater"
  ],
  "cat": "plugin",
  "d": "Fijiで、更新サイトとプラグインを管理する仕組みです。Bio-Formatsの更新も、こちらを使うことが推奨されます。",
  "detail": "本体とプラグインの更新を一元管理します。更新により挙動が変わり得ます。そのため、重要な解析の途中での一括更新は避けます。更新後は、代表データで再検証します。",
  "vs": "個別にファイルを差し替える手動管理とは、再現性・追跡性の面で異なります。",
  "ex": "更新サイトを追加して、新しい解析プラグインを導入します。",
  "related": [
   "更新サイト（Update Site）",
   "Bio-Formats",
   "Fiji"
  ],
  "src": "bio"
 },
 {
  "t": "更新サイト（Update Site）",
  "en": "Update Site",
  "aliases": [
   "update site",
   "アップデートサイト"
  ],
  "cat": "plugin",
  "d": "Updaterに登録して、プラグイン一式を配布・更新するための仕組みです。",
  "detail": "有効化した更新サイトの組み合わせが、その環境で使える機能を決めます。手順を共有する際は、有効な更新サイトも条件として記録すべきです。",
  "vs": "単体のプラグインファイルの配布とは、管理の単位が異なります。",
  "ex": "研究室で共通の更新サイト構成にそろえて、環境を統一します。",
  "related": [
   "ImageJ Updater",
   "プラグイン"
  ],
  "src": "bio"
 },
 {
  "t": "StartupMacros",
  "en": "StartupMacros",
  "aliases": [
   "スタートアップマクロ"
  ],
  "cat": "plugin",
  "d": "ImageJ/macrosフォルダのStartupMacros.txtです。起動時に自動でインストールされるマクロ群のファイルです。",
  "detail": "よく使うマクロを、起動直後から使えるようにするための仕組みです。共有環境では、ここに何が入っているかが操作感の差になります。",
  "vs": "通常の .ijm（手動で実行します）とは、読み込みのタイミングが異なります。",
  "ex": "共通の測定マクロを、起動時に自動で読み込みます。",
  "related": [
   ".ijm / マクロファイル",
   "プラグイン"
  ],
  "src": "plug"
 },
 {
  "t": "Subtract Background",
  "en": "Subtract Background",
  "aliases": [
   "背景補正コマンド",
   "サブトラクトバックグラウンド"
  ],
  "cat": "flow",
  "d": "Processメニューの背景補正です。ローリングボールで推定した滑らかな背景を差し引いて、背景を均します。",
  "detail": "半径の目安は型で異なります。8-bit/RGBでは「背景でない最大対象の半径以上」、16-bit（0〜65535）では0.2〜5程度が典型値とされます。明るい背景に暗い対象がある場合は、Light Background を指定します。補正は信号自体も変えるため、条件の統一と記録が必須です。",
  "vs": "背景差し引き（Image Calculatorで自前で組む引き算）とは、背景の推定方法が異なります。",
  "ex": "照明ムラのある画像の、閾値処理の前処理として使います。",
  "related": [
   "ローリングボール半径",
   "背景差し引き"
  ],
  "src": "subbg"
 },
 {
  "t": "ローリングボール半径",
  "en": "Rolling Ball Radius",
  "aliases": [
   "rolling ball radius",
   "ボール半径"
  ],
  "cat": "flow",
  "d": "Subtract Backgroundで背景推定に使う、ボールの半径です。8-bit/RGBでは、背景ではない最大対象の半径以上の大きさに設定します。",
  "detail": "小さすぎると、対象自体が背景として差し引かれます。画素値の範囲が大きく異なる画像では、半径は値の範囲に反比例する方向へ調整します。Sliding Paraboloid を選択したときは、放物面の曲率半径として解釈されます。",
  "vs": "フィルタの Radius（近傍の大きさ）とは、意味する対象が異なります。",
  "ex": "対象の大きさを見積もってから半径を決め、Previewで確認します。",
  "related": [
   "Subtract Background"
  ],
  "src": "subbg"
 },
 {
  "t": "Z投影",
  "en": "Z Projection",
  "aliases": [
   "Zプロジェクション",
   "Z Project",
   "z projection"
  ],
  "cat": "flow",
  "d": "Image > Stacks > Z Project です。スタックをZ軸方向に投影して、1枚にまとめる処理です。最大値・平均・合計などの方式があります。",
  "detail": "方式は、平均・最大・最小・合計・標準偏差・中央値の6種です。方式によって、画素値の意味が変わります。投影範囲の指定も条件の一部です。方式名とあわせて記録します。",
  "vs": "単一スライスの抽出とは違い、全スライス（または指定範囲のスライス）を集約する処理です。",
  "ex": "蛍光の全体構造を、Maximum 投影で1枚にまとめます。",
  "related": [
   "スタック",
   "スライス"
  ],
  "src": "zproj"
 },
 {
  "t": "スケールバー",
  "en": "Scale Bar",
  "aliases": [
   "scale bar",
   "バー",
   "縮尺バー"
  ],
  "cat": "flow",
  "d": "Analyze > Tools > Scale Barで描く、校正単位で長さを示すラベル付きバーです。Set Scaleによる校正が前提になります。",
  "detail": "Widthは校正単位でのバーの長さ、Heightはピクセル単位の太さを指定します。画像に空間校正が設定されていることが前提です。すでに校正済みの画像では、Set Scale のやり直しは不要です。オーバーレイとして描けば、元の画素は保持されます。",
  "vs": "単なる図形の線とは違い、校正に基づく実長を表します。",
  "ex": "論文図版に、10 µm のスケールバーを入れます。",
  "related": [
   "Set Scale",
   "オーバーレイ"
  ],
  "src": "tools"
 },
 {
  "t": "Merge Channels",
  "en": "Merge Channels",
  "aliases": [
   "チャンネル合成",
   "マージチャンネル"
  ],
  "cat": "flow",
  "d": "Image > Colorのコマンドです。開いているグレースケール画像を各チャンネルに割り当てて、合成画像を作ります。",
  "detail": "Create Composite を選ぶと、チャンネルを分離保持するコンポジット画像になります。表示のオン/オフや再分離ができます。割り当てミスは、チャンネルの取り違えに直結します。",
  "vs": "Split Channels（分離）とは逆の操作です。RGBへの焼き込みとは違い、コンポジットでは分離が保持されます。",
  "ex": "3色の蛍光画像を合成して、重なりを確認します。",
  "related": [
   "コンポジット画像",
   "チャンネル"
  ],
  "src": "color"
 },
 {
  "t": "バッチマクロ（Process > Batch）",
  "en": "Batch Macro (Process > Batch)",
  "aliases": [
   "Batch > Macro",
   "バッチ > マクロ"
  ],
  "cat": "flow",
  "d": "Process > Batch > Macro です。入力フォルダ内の全画像に同じマクロを適用し、出力フォルダへ保存する仕組みです。",
  "detail": "出力フォルダを指定しないと、バッチ機能による自動保存はされません（マクロ内に保存処理を書いた場合は、その限りではありません）。同名の出力は上書きされることがあります。そのため、出力は入力と別のフォルダにし、元画像のバックアップを残します。",
  "vs": "setBatchMode()（表示を止める関数）とは、別の仕組みです。",
  "ex": "フォルダ内の全画像に、同じ測定マクロを適用します。",
  "related": [
   "バッチ処理",
   ".ijm / マクロファイル"
  ],
  "src": "batch"
 },
 {
  "t": "バッチモード",
  "en": "Batch Mode",
  "aliases": [
   "setBatchMode"
  ],
  "cat": "macro",
  "d": "マクロ実行中に画像ウィンドウの表示を抑え、処理を高速化するモードです。setBatchMode(true) で切り替えます。",
  "detail": "表示の更新が省略されるため、大量の画像を処理するマクロで大きな差が出ます。終わったら setBatchMode(false) に戻します。表示を前提にした操作や確認は効かなくなる点に注意します。",
  "vs": "バッチマクロ（Process > Batch）はフォルダ一括処理の仕組みで、表示抑制のモードとは別のものです。",
  "ex": "数百枚の測定マクロの先頭で有効化します。",
  "related": [
   "バッチマクロ（Process > Batch）",
   "バッチ処理"
  ],
  "src": "plug"
 }
];
