window.IJDATA2 = window.IJDATA2 || {};
window.IJDATA2.functionCats = { image:"画像と画素", roi:"ROIと描画", measure:"測定と結果", stack:"スタックとチャンネル", file:"ファイルと入出力", dialog:"ダイアログと表示", string:"文字列と配列", math:"数学と統計", control:"実行制御" };
window.IJDATA2.functions = [
 {
  "name": "getPixel",
  "sig": "getPixel(x, y)",
  "cat": "image",
  "desc": "アクティブ画像の座標 (x, y) にある画素の、生の値（校正されていない格納値）を返します。スカラー画像ではその画素値が返ります。RGB画像では、色をパックした値が返ります。座標が画像の外にある場合は 0 になります。",
  "ret": "画素の生値（数値）",
  "ex": "v = getPixel(100, 50);\nprint(v);",
  "note": "座標に整数でない値を与えると、双線形補間で求めた値が返ります。校正済みの物理量が欲しい場合は getValue(x, y) を使います。",
  "ver": null
 },
 {
  "name": "getValue",
  "sig": "getValue(x, y)",
  "cat": "image",
  "desc": "アクティブ画像の座標 (x, y) の画素について、校正済みの値（物理量）を返します。getPixel と違い、密度キャリブレーションが適用された値です。校正されていない画像では、生の値と一致します。",
  "ret": "校正済みの画素値（数値）",
  "ex": "v = getValue(100, 50);",
  "note": "第1引数に \"Mean\" のような測定項目名の文字列を与えると、現在の画像や選択についての、その測定値を返す形式もあります（例: getValue(\"Mean\")）。生の格納値が欲しい場合は getPixel を使います。",
  "ver": null
 },
 {
  "name": "setPixel",
  "sig": "setPixel(x, y, value)",
  "cat": "image",
  "desc": "アクティブ画像の座標 (x, y) に value を書き込みます。1つの画素を直接描くための関数で、一括処理には向きません。書き込みは画素単位で、すぐに実行されます。",
  "ret": null,
  "ex": "setPixel(10, 10, 255);\nupdateDisplay();",
  "note": "画面への反映はマクロの終了時です。途中で見せたい場合は updateDisplay() を呼びます。",
  "ver": null
 },
 {
  "name": "setColor",
  "sig": "setColor(r, g, b)",
  "cat": "image",
  "desc": "描画色（前景色）を、赤・緑・青の値で設定します。drawLine や fill、draw などの描画関数は、この色で描きます。グレースケール画像では、明るさの値として解釈されます。",
  "ret": null,
  "ex": "setColor(255, 0, 0);\ndrawLine(10, 10, 100, 50);",
  "note": "色を名前で指定する setColor(\"red\") のような文字列形式や、グレースケール用の setColor(value) 形式もあります。",
  "ver": null
 },
 {
  "name": "drawLine",
  "sig": "drawLine(x1, y1, x2, y2)",
  "cat": "image",
  "desc": "点 (x1, y1) から点 (x2, y2) へ、現在の描画色と線幅で、アクティブ画像に直線を描きます。描画すると、画像そのものが書き換わります。",
  "ret": null,
  "ex": "setColor(255, 0, 0);\ndrawLine(10, 10, 100, 50);",
  "note": "線幅は setLineWidth(太さ) で変更できます。元に戻せない書き換えなので、注釈の用途ではオーバーレイ（Overlay）の利用も検討してください。",
  "ver": null
 },
 {
  "name": "getWidth",
  "sig": "getWidth()",
  "cat": "image",
  "desc": "アクティブ画像の幅を、ピクセル数で返します。選択範囲ではなく、画像全体の寸法を返します。",
  "ret": "画像の幅（ピクセル数）",
  "ex": "w = getWidth();",
  "note": null,
  "ver": null
 },
 {
  "name": "getHeight",
  "sig": "getHeight()",
  "cat": "image",
  "desc": "アクティブ画像の高さを、ピクセル数で返します。選択範囲ではなく、画像全体の寸法を返します。",
  "ret": "画像の高さ（ピクセル数）",
  "ex": "h = getHeight();",
  "note": null,
  "ver": null
 },
 {
  "name": "bitDepth",
  "sig": "bitDepth()",
  "cat": "image",
  "desc": "アクティブ画像のビット深度を返します。8bit グレースケールや浮動小数点画像では 8 や 32、RGBカラー画像では 24 を返します。処理を分岐させる条件判定によく使います。",
  "ret": "8、16、24（RGBカラー）、32 のいずれか",
  "ex": "if (bitDepth() == 8) print(\"8bit画像\");",
  "note": null,
  "ver": null
 },
 {
  "name": "getTitle",
  "sig": "getTitle()",
  "cat": "image",
  "desc": "アクティブな画像ウィンドウのタイトル（通常はファイル名）を、文字列で返します。画像の識別や、結果のラベル付けに使います。",
  "ret": "ウィンドウタイトル（文字列）",
  "ex": "title = getTitle();",
  "note": null,
  "ver": null
 },
 {
  "name": "getInfo",
  "sig": "getInfo(key)",
  "cat": "image",
  "desc": "キーで指定した情報を、文字列で返します。\"image.title\" や \"slice.label\"、\"os.name\"、\"log\" など、画像やウィンドウ、環境に関する多数のキーが用意されています。",
  "ret": "キーに対応する文字列",
  "ex": "t = getInfo(\"image.title\");",
  "note": "キーに対応する情報が無い場合は、空文字列になります。利用できるキーは、公式リファレンスの getInfo の項に一覧があります。",
  "ver": null
 },
 {
  "name": "getImageID",
  "sig": "getImageID()",
  "cat": "image",
  "desc": "アクティブ画像の一意な ID を返します。ID は負の整数です。selectImage() と組み合わせて、対象の画像を切り替えます。タイトルよりも確実に画像を特定できます。",
  "ret": "画像ID（負の整数）",
  "ex": "id = getImageID();",
  "note": null,
  "ver": null
 },
 {
  "name": "selectImage",
  "sig": "selectImage(id)",
  "cat": "image",
  "desc": "ID またはタイトルで指定した画像をアクティブにします。以後の処理は、その画像に対して行われます。数値を与えれば ID で、文字列を与えればタイトルで選びます。",
  "ret": null,
  "ex": "selectImage(id);",
  "note": "タイトル指定では、同名の画像が複数あると意図しない方を選ぶことがあります。確実なのは ID 指定です。",
  "ver": null
 },
 {
  "name": "selectWindow",
  "sig": "selectWindow(title)",
  "cat": "image",
  "desc": "タイトルで指定したウィンドウ（画像）をアクティブにします。以後の処理は、その画像に対して行われます。タイトルは完全一致で指定します。",
  "ret": null,
  "ex": "selectWindow(\"demo.tif\");",
  "note": "一致するウィンドウが無いと、エラーで止まります。ID で確実に選びたい場合は selectImage を使います。",
  "ver": null
 },
 {
  "name": "newImage",
  "sig": "newImage(title, type, width, height, slices)",
  "cat": "image",
  "desc": "指定した種類と大きさの新しい画像を作って開きます。type は \"8-bit\"、\"16-bit\"、\"32-bit\"、\"RGB\" などです。中身の初期値は、8-bitとRGBでは白、16-bitと32-bitでは黒が既定です。type に \"black\" や \"white\" を含めると指定できます。\"ramp\" や \"noise\" を含めると、勾配画像やノイズ画像としても作れます。",
  "ret": null,
  "ex": "newImage(\"work\", \"8-bit black\", 512, 512, 1);",
  "note": "チャンネル数と時間軸（フレーム）まで指定する7引数形式 newImage(title, type, width, height, channels, slices, frames) もあります。7引数形式では、スライス数が channels×slices×frames になります。",
  "ver": null
 },
 {
  "name": "nImages",
  "sig": "nImages",
  "cat": "image",
  "desc": "現在開かれている画像ウィンドウの総数を返します。定義済み変数として働くため、括弧は省略できます。開いている画像すべてへのループ処理の上限に使います。",
  "ret": "開いている画像の数",
  "ex": "for (i = 0; i < nImages; i++) { }",
  "note": "括弧を付けても同じです。画像が1枚も開かれていない状態で、画像を前提とする処理を行うとエラーになります。",
  "ver": null
 },
 {
  "name": "getDimensions",
  "sig": "getDimensions(width, height, channels, slices, frames)",
  "cat": "image",
  "desc": "アクティブ画像の5次元サイズを、指定した変数に書き込みます。幅と高さに加えて、チャンネル数・スライス数・フレーム数が一度に得られます。スタックやハイパースタックの構造確認に使います。",
  "ret": null,
  "ex": "getDimensions(w, h, ch, sl, fr);\nprint(ch, sl, fr);",
  "note": "引数はすべて「書き込み先の変数名」です。値を返す関数ではない点に注意してください。",
  "ver": null
 },
 {
  "name": "getVoxelSize",
  "sig": "getVoxelSize(width, height, depth, unit)",
  "cat": "image",
  "desc": "現在の画像やスタックに設定されたボクセル（画素）の物理サイズと単位を、指定した変数に書き込みます。空間校正が済んでいるかどうかの確認にも使えます。",
  "ret": null,
  "ex": "getVoxelSize(vw, vh, vd, unit);\nprint(vw, unit);",
  "note": "引数はすべて書き込み先の変数名です。単位は複数形の文字列で返ります。校正されていない画像では、幅と高さが 1.0、単位が \"pixels\" になります。",
  "ver": null
 },
 {
  "name": "getPixelSize",
  "sig": "getPixelSize(unit, pixelWidth, pixelHeight)",
  "cat": "image",
  "desc": "現在の画像に設定された空間校正のうち、単位（文字列）と1ピクセルの幅・高さを変数に書き込みます。getVoxelSize の2次元版にあたる取得関数です。",
  "ret": null,
  "ex": "getPixelSize(unit, pw, ph);\nprint(unit, pw);",
  "note": "引数はすべて書き込み先の変数名です。奥行き（z間隔）も含めて知りたい場合は getVoxelSize を使います。",
  "ver": null
 },
 {
  "name": "getLut",
  "sig": "getLut(reds, greens, blues)",
  "cat": "image",
  "desc": "現在の画像のLUT（ルックアップテーブル）を、赤・緑・青それぞれ256要素の配列として変数に書き込みます。疑似カラーの対応表をプログラムで読み取るための関数です。",
  "ret": null,
  "ex": "getLut(r, g, b);\nprint(r[255]);",
  "note": "引数は書き込み先の変数名です。LUTの設定は setLut や Color.setLut で行います。",
  "ver": null
 },
 {
  "name": "getDateAndTime",
  "sig": "getDateAndTime(year, month, dayOfWeek, dayOfMonth, hour, minute, second, msec)",
  "cat": "image",
  "desc": "現在の日時を分解して、指定した変数に書き込みます。ログへの時刻の記録や、処理にかかった時間の計測の起点などに使います。",
  "ret": null,
  "ex": "getDateAndTime(y, mo, dow, d, h, mi, s, ms);\nprint(h, mi);",
  "note": "引数はすべて書き込み先の変数名です。month と dayOfWeek は 0 始まりの番号で返ります。経過時間の計測には getTime のほうが向いています。",
  "ver": null
 },
 {
  "name": "getLocationAndSize",
  "sig": "getLocationAndSize(x, y, width, height)",
  "cat": "image",
  "desc": "アクティブな画像ウィンドウの、画面座標での位置と大きさを変数に書き込みます。ウィンドウ配置の記録や再現に使います。",
  "ret": null,
  "ex": "getLocationAndSize(x, y, w, h);",
  "note": "引数はすべて書き込み先の変数名です。画像そのものの幅と高さは getWidth / getHeight で得られます。",
  "ver": null
 },
 {
  "name": "getDisplayedArea",
  "sig": "getDisplayedArea(x, y, width, height)",
  "cat": "image",
  "desc": "画像キャンバスに実際に表示されている領域のピクセル座標（左上と幅・高さ）を、変数に書き込みます。拡大表示で一部だけが見えているときに、見えている範囲を対象に処理するための関数です。",
  "ret": null,
  "ex": "getDisplayedArea(x, y, w, h);",
  "note": "引数はすべて書き込み先の変数名です。全体が表示されている場合は、画像全体の範囲が返ります。",
  "ver": null
 },
 {
  "name": "setVoxelSize",
  "sig": "setVoxelSize(width, height, depth, unit)",
  "cat": "image",
  "desc": "現在の画像やスタックに、ボクセルの物理サイズと長さの単位を設定します。空間校正を行う関数で、測定結果のスケールに直接影響します。",
  "ret": null,
  "ex": "setVoxelSize(0.5, 0.5, 1.0, \"um\");",
  "note": "単位に \"um\" を与えると \"µm\" に変換されます。対象がスタックでない場合、depth 引数は無視されます。",
  "ver": null
 },
 {
  "name": "changeValues",
  "sig": "changeValues(v1, v2, v3)",
  "cat": "image",
  "desc": "画素値が v1 以上 v2 以下の範囲にある画素を、すべて v3 に置き換えます。背景値の統一や、特定の値の範囲だけを潰す前処理に使います。",
  "ret": null,
  "ex": "changeValues(0, 0, 255);",
  "note": "RGB画像では色をパックした値として比較されるため、チャンネルごとに分けて考える使い方はできません。",
  "ver": null
 },
 {
  "name": "getMinAndMax",
  "sig": "getMinAndMax(min, max)",
  "cat": "image",
  "desc": "現在の表示範囲（輝度/コントラスト設定）の下限と上限を、指定した変数に書き込みます。表示設定の保存や再現、変換前の確認に使います。",
  "ret": null,
  "ex": "getMinAndMax(dmin, dmax);",
  "note": "これは画素そのものの最小・最大値ではなく「表示範囲」です。画素の統計が欲しい場合は getStatistics を使います。",
  "ver": null
 },
 {
  "name": "setMinAndMax",
  "sig": "setMinAndMax(min, max)",
  "cat": "image",
  "desc": "アクティブ画像の表示範囲（輝度/コントラスト）の下限と上限を設定します。グレースケール画像では画素値そのものは変更せず、見え方だけを変えます。",
  "ret": null,
  "ex": "setMinAndMax(20, 200);\nupdateDisplay();",
  "note": "RGB画像はチャンネルごとのLUTを持たないため、表示範囲の設定で画素値そのものが書き換わります。グレースケール画像でもデータは変わりません。ただし、8bitへの変換など一部のコマンドは表示範囲を参照して画素化するため、結果に影響します。",
  "ver": null
 },
 {
  "name": "Color.getLut",
  "sig": "Color.getLut(reds, greens, blues)",
  "cat": "image",
  "desc": "アクティブ画像のルックアップテーブル（LUT）を、赤・緑・青それぞれ256要素の配列として変数に書き込みます。LUT の内容を調べたり、加工して書き戻したりする前段に使います。",
  "ret": null,
  "ex": "Color.getLut(r, g, b);\nprint(r[255], g[255], b[255]);",
  "note": "Color 系の関数は ImageJ 1.53h 以降で使えます。引数は書き込み先の変数名です。",
  "ver": "1.53h以降"
 },
 {
  "name": "isOpen",
  "sig": "isOpen(id)",
  "cat": "image",
  "desc": "指定した ID またはタイトルの画像が開かれているかどうかを返します。処理の前に、対象画像の存在を確認して分岐させるために使います。",
  "ret": "開かれていれば 1、そうでなければ 0",
  "ex": "if (isOpen(\"Result\")) selectImage(\"Result\");",
  "note": "タイトル指定と ID 指定の両方が可能です。",
  "ver": null
 },
 {
  "name": "makeRectangle",
  "sig": "makeRectangle(x, y, width, height)",
  "cat": "roi",
  "desc": "左上隅が (x, y)、幅が width、高さが height の矩形選択（ROI）を、アクティブ画像上に作ります。座標はピクセル単位です。既存の選択があれば置き換わります。",
  "ret": null,
  "ex": "makeRectangle(10, 20, 100, 50);",
  "note": null,
  "ver": null
 },
 {
  "name": "makeOval",
  "sig": "makeOval(x, y, width, height)",
  "cat": "roi",
  "desc": "外接矩形の左上隅 (x, y) と幅・高さで、楕円選択を作ります。円にしたい場合は、幅と高さを同じ値にします。",
  "ret": null,
  "ex": "makeOval(30, 30, 80, 80);",
  "note": null,
  "ver": null
 },
 {
  "name": "makePolygon",
  "sig": "makePolygon(x1, y1, x2, y2, x3, y3, ...)",
  "cat": "roi",
  "desc": "頂点座標の列から多角形選択を作ります。最低3点が必要です。最後の点は自動的に最初の点と結ばれて閉じます。フリーハンドに頼らない、再現性のある ROI 指定ができます。",
  "ret": null,
  "ex": "makePolygon(10,10, 90,10, 50,80);",
  "note": "座標はピクセル単位で、x と y を交互に並べて与えます。",
  "ver": null
 },
 {
  "name": "makeLine",
  "sig": "makeLine(x1, y1, x2, y2)",
  "cat": "roi",
  "desc": "2点間に直線選択を作ります。始点 (x1, y1) から終点 (x2, y2) へ引く線分で、ラインプロファイルや線幅のある測定の対象になります。座標の組を3つ以上続けて与えると折れ線になります。",
  "ret": null,
  "ex": "makeLine(0, 0, 200, 120);",
  "note": "線幅は第5引数で makeLine(x1, y1, x2, y2, lineWidth) のように指定できます。作成後に Roi.setStrokeWidth で設定する方法もあります。",
  "ver": null
 },
 {
  "name": "makeSelection",
  "sig": "makeSelection(type, xpoints, ypoints)",
  "cat": "roi",
  "desc": "頂点座標の配列から、種類を指定して選択を作ります。type には \"polygon\"、\"freehand\"、\"polyline\"、\"freeline\"、\"angle\"、\"point\" などが指定できます。座標配列をプログラムで生成する処理と相性がよい関数です。",
  "ret": null,
  "ex": "makeSelection(\"polygon\", xs, ys);",
  "note": "座標は2つの配列（x座標の列とy座標の列）で与えます。",
  "ver": null
 },
 {
  "name": "getSelectionBounds",
  "sig": "getSelectionBounds(x, y, width, height)",
  "cat": "roi",
  "desc": "現在の選択の外接矩形（バウンディングボックス）の左上座標と幅・高さを、指定した変数に書き込みます。選択の位置や大きさに基づく処理に使います。",
  "ret": null,
  "ex": "getSelectionBounds(bx, by, bw, bh);",
  "note": "引数はすべて書き込み先の変数名です。選択がない場合はエラーにならず、画像全体（0, 0, 画像の幅, 画像の高さ）が書き込まれます。",
  "ver": null
 },
 {
  "name": "getSelectionCoordinates",
  "sig": "getSelectionCoordinates(xpoints, ypoints)",
  "cat": "roi",
  "desc": "現在の選択を定義する点の座標を、x座標の配列とy座標の配列として変数に書き込みます。Roi.getCoordinates と同じ情報を、名前空間なしで提供する関数です。",
  "ret": null,
  "ex": "getSelectionCoordinates(xs, ys);\nprint(xs.length);",
  "note": "引数は書き込み先の変数名です。外接矩形だけが欲しい場合は getSelectionBounds を使います。",
  "ver": null
 },
 {
  "name": "getLine",
  "sig": "getLine(x1, y1, x2, y2, lineWidth)",
  "cat": "roi",
  "desc": "現在の直線選択の始点・終点の座標と線幅を、指定した変数に書き込みます。直線選択がない場合は、x1 に -1 が入ります。",
  "ret": null,
  "ex": "getLine(x1, y1, x2, y2, w);\nif (x1 >= 0) print(w);",
  "note": "引数はすべて書き込み先の変数名で、座標と線幅はピクセル単位です。プロファイルの取得は getProfile と組み合わせます。",
  "ver": null
 },
 {
  "name": "getCursorLoc",
  "sig": "getCursorLoc(x, y, z, modifiers)",
  "cat": "roi",
  "desc": "カーソルの位置（ピクセル座標）と、マウスイベントの修飾フラグを変数に書き込みます。ツールの自作などで、クリック位置に応じた処理を組むための関数です。",
  "ret": null,
  "ex": "getCursorLoc(x, y, z, flags);\nprint(x, y);",
  "note": "引数はすべて書き込み先の変数名です。z は2次元画像では 0、スタックではスライス番号から1を引いた値です。実寸座標への変換には toScaled を使います。",
  "ver": null
 },
 {
  "name": "selectionType",
  "sig": "selectionType()",
  "cat": "roi",
  "desc": "現在の選択の種類を数値コードで返します。矩形=0、楕円=1、多角形=2、自由形=3、トレース=4、直線=5、折れ線=6、自由線=7、角度=8、複合=9、点=10 です。選択がなければ -1 です。",
  "ret": "選択種別のコード（選択なしは -1）",
  "ex": "if (selectionType() == -1) exit(\"ROIがありません\");",
  "note": "処理の前に ROI の有無を判定する、定番の使い方をします。",
  "ver": null
 },
 {
  "name": "roiManager",
  "sig": "roiManager(\"command\", ...)",
  "cat": "roi",
  "desc": "ROI Manager をコマンド文字列で操作する関数です。代表的なコマンドには、\"add\"（現在の選択を登録）、\"count\"（登録数の取得）、\"select\"（番号指定で選択を復元）、\"measure\"（登録ROIを一括測定）、\"reset\"（全消去）、\"save\" などがあります。複数の ROI を管理する自動処理の中核になります。",
  "ret": "コマンドによる（例: \"count\" は登録数を返す）",
  "ex": "roiManager(\"add\");\nn = roiManager(\"count\");",
  "note": "コマンド名は大文字小文字を区別しませんが、引数の要否はコマンドごとに異なります。",
  "ver": null
 },
 {
  "name": "Roi.getBounds",
  "sig": "Roi.getBounds(x, y, width, height)",
  "cat": "roi",
  "desc": "現在の選択の外接矩形（バウンディングボックス）の左上座標と幅・高さを、指定した変数に書き込みます。getSelectionBounds と同じ情報を、Roi 名前空間で提供する関数です。",
  "ret": null,
  "ex": "Roi.getBounds(x, y, w, h);\nprint(w, h);",
  "note": "引数はすべて書き込み先の変数名で、値はピクセル単位の整数です。小数で欲しい場合は Roi.getFloatBounds を使います。",
  "ver": null
 },
 {
  "name": "Roi.getCoordinates",
  "sig": "Roi.getCoordinates(xpoints, ypoints)",
  "cat": "roi",
  "desc": "現在の選択を定義する頂点座標を、x座標の配列とy座標の配列として変数に書き込みます。多角形や折れ線などの頂点列を、プログラムで扱うための関数です。",
  "ret": null,
  "ex": "Roi.getCoordinates(xs, ys);\nprint(xs.length);",
  "note": "引数は書き込み先の変数名です。選択内部の全画素座標が欲しい場合は Roi.getContainedPoints を使います。",
  "ver": null
 },
 {
  "name": "Roi.contains",
  "sig": "Roi.contains(x, y)",
  "cat": "roi",
  "desc": "点 (x, y) が現在の選択の内側にあるかどうかを返します。座標ごとに処理を分けたい場合の判定に使います。",
  "ret": "内側なら 1、外側なら 0",
  "ex": "if (Roi.contains(100, 50)) print(\"内側\");",
  "note": null,
  "ver": null
 },
 {
  "name": "Roi.move",
  "sig": "Roi.move(x, y)",
  "cat": "roi",
  "desc": "現在の選択を、外接矩形の左上が指定座標になる位置へ移動します。大きさと形は変わりません。",
  "ret": null,
  "ex": "Roi.move(50, 50);",
  "note": "現在の位置からの相対移動には Roi.translate を使います。",
  "ver": null
 },
 {
  "name": "Roi.translate",
  "sig": "Roi.translate(dx, dy)",
  "cat": "roi",
  "desc": "現在の選択を dx、dy だけ平行移動します。Roi.move が絶対位置の指定なのに対し、こちらは現在の位置からの相対移動です。",
  "ret": null,
  "ex": "Roi.translate(10, -5);",
  "note": null,
  "ver": "1.53v以降"
 },
 {
  "name": "Roi.setStrokeWidth",
  "sig": "Roi.setStrokeWidth(width)",
  "cat": "roi",
  "desc": "現在の選択の輪郭線の太さを設定します。直線や折れ線の選択では、測定に使う線幅にもなります。作成後の線幅変更は、この関数で行います。",
  "ret": null,
  "ex": "makeLine(0, 0, 200, 120);\nRoi.setStrokeWidth(10);",
  "note": "線幅は makeLine の第5引数でも指定できます。縮小表示で細くなりすぎないための最小の太さは、Roi.setMinStrokeWidth で指定します。",
  "ver": null
 },
 {
  "name": "Roi.setStrokeColor",
  "sig": "Roi.setStrokeColor(color)",
  "cat": "roi",
  "desc": "現在の選択の輪郭線の色を設定します。色は \"red\" のような名前や16進文字列で指定できます。RGB の3引数形式や、色をパックした値の1引数形式もあります。",
  "ret": null,
  "ex": "Roi.setStrokeColor(\"red\");",
  "note": "塗りの色は Roi.setFillColor で設定します。1.54e以降では、塗りを設定した後に輪郭色を設定すると、塗りと輪郭の両方が描かれます。",
  "ver": null
 },
 {
  "name": "Roi.setFillColor",
  "sig": "Roi.setFillColor(color)",
  "cat": "roi",
  "desc": "現在の選択の塗りの色を設定します。色の指定方法は Roi.setStrokeColor と同じで、名前・16進文字列・RGB 3引数・パック値が使えます。",
  "ret": null,
  "ex": "Roi.setFillColor(\"yellow\");",
  "note": "塗りは Overlay や描画時に反映されます。輪郭だけの表示に戻す操作とは別のものです。",
  "ver": null
 },
 {
  "name": "Roi.setName",
  "sig": "Roi.setName(name)",
  "cat": "roi",
  "desc": "現在の選択に名前を設定します。ROI Manager に登録した際の表示名になります。名前で選択を特定する処理の手がかりにもなります。",
  "ret": null,
  "ex": "Roi.setName(\"cell-01\");",
  "note": "名前の取得は Roi.getName で行います。現在の選択名は getInfo(\"selection.name\") でも得られます。",
  "ver": null
 },
 {
  "name": "Roi.getName",
  "sig": "Roi.getName",
  "cat": "roi",
  "desc": "現在の選択の名前を返します。名前が設定されていない選択では、空文字列になります。",
  "ret": "選択の名前（文字列）",
  "ex": "n = Roi.getName();",
  "note": "括弧を付けても同じです。名前の設定は Roi.setName です。",
  "ver": null
 },
 {
  "name": "Roi.setPosition",
  "sig": "Roi.setPosition(channel, slice, frame)",
  "cat": "roi",
  "desc": "現在の選択が属する、ハイパースタック上の位置（チャンネル・スライス・フレーム）を設定します。スライスだけを指定する1引数形式もあります。",
  "ret": null,
  "ex": "Roi.setPosition(1, 5, 1);",
  "note": "0 を指定した次元は、その次元では位置を持たない扱いになります。",
  "ver": "1.53b以降"
 },
 {
  "name": "Roi.getPosition",
  "sig": "Roi.getPosition(channel, slice, frame)",
  "cat": "roi",
  "desc": "現在の選択が属する、ハイパースタック上の位置を、指定した変数に書き込みます。Roi.setPosition で設定した位置の読み取りに使います。",
  "ret": null,
  "ex": "Roi.getPosition(c, z, t);\nprint(z);",
  "note": "引数はすべて書き込み先の変数名です。位置が設定されていない次元は 0 が返ります。",
  "ver": null
 },
 {
  "name": "Roi.getProperty",
  "sig": "Roi.getProperty(key)",
  "cat": "roi",
  "desc": "選択に付けられたプロパティ（キーと値の組）のうち、指定したキーの値を文字列で返します。キーが無ければ空文字列です。Roi.setProperty で付けた付帯情報の読み取りに使います。",
  "ret": "キーの値（文字列）",
  "ex": "v = Roi.getProperty(\"group\");",
  "note": null,
  "ver": null
 },
 {
  "name": "Roi.setProperty",
  "sig": "Roi.setProperty(key, value)",
  "cat": "roi",
  "desc": "選択に、キーと値の組のプロパティを追加します。分類や条件などの付帯情報を、選択自体に持たせるための仕組みです。読み取りは Roi.getProperty で行います。",
  "ret": null,
  "ex": "Roi.setProperty(\"group\", \"A\");",
  "note": "第2引数を省略すると、値 \"1\" として追加されます。",
  "ver": null
 },
 {
  "name": "RoiManager.select",
  "sig": "RoiManager.select(index)",
  "cat": "roi",
  "desc": "ROI Manager のリストで、番号（0始まり）で指定した ROI をアクティブな選択にします。roiManager(\"select\", index) と同じ働きを、名前空間形式で提供します。",
  "ret": null,
  "ex": "RoiManager.select(0);",
  "note": "名前で選びたい場合は RoiManager.selectByName を使います。",
  "ver": null
 },
 {
  "name": "RoiManager.selectByName",
  "sig": "RoiManager.selectByName(name)",
  "cat": "roi",
  "desc": "ROI Manager のリストで、名前で指定した ROI をアクティブな選択にします。同名が複数ある場合は、最初に一致したものが選ばれます。",
  "ret": null,
  "ex": "RoiManager.selectByName(\"cell-01\");",
  "note": null,
  "ver": "1.53s以降"
 },
 {
  "name": "RoiManager.getName",
  "sig": "RoiManager.getName(index)",
  "cat": "roi",
  "desc": "ROI Manager のリストで、番号（0始まり）で指定した ROI の名前を返します。名前が設定されていない ROI では、空文字列になります。",
  "ret": "ROI の名前（文字列）",
  "ex": "n = RoiManager.getName(0);",
  "note": "名前から番号を引く場合は RoiManager.getIndex を使います。",
  "ver": null
 },
 {
  "name": "RoiManager.getIndex",
  "sig": "RoiManager.getIndex(name)",
  "cat": "roi",
  "desc": "ROI Manager のリストで、指定した名前を持つ最初の ROI の番号（0始まり）を返します。該当する ROI が無ければ -1 になります。",
  "ret": "ROI の番号（無ければ -1）",
  "ex": "i = RoiManager.getIndex(\"cell-01\");",
  "note": null,
  "ver": "1.53s以降"
 },
 {
  "name": "RoiManager.delete",
  "sig": "RoiManager.delete(index)",
  "cat": "roi",
  "desc": "ROI Manager のリストから、番号（0始まり）で指定した ROI を削除します。全件の消去には roiManager(\"reset\") を使います。",
  "ret": null,
  "ex": "RoiManager.delete(0);",
  "note": null,
  "ver": "1.54k以降"
 },
 {
  "name": "setForegroundColor",
  "sig": "setForegroundColor(r, g, b)",
  "cat": "roi",
  "desc": "前景色（描画色）を赤・緑・青の値で設定します。setColor と同じく、drawLine や fill などの描画関数がこの色で描きます。背景色の設定は setBackgroundColor で行います。",
  "ret": null,
  "ex": "setForegroundColor(255, 0, 0);\ndrawRect(10, 10, 50, 50);",
  "note": "引数を1つにして、色をパックした値で指定する setForegroundColor(rgb) 形式もあります。",
  "ver": null
 },
 {
  "name": "getStatistics",
  "sig": "getStatistics(area, mean, min, max, std, histogram)",
  "cat": "measure",
  "desc": "アクティブ画像（選択があればその範囲）の統計量を計算し、指定した変数に書き込みます。面積・平均・最小・最大・標準偏差・ヒストグラム配列が得られます。ROI の有無で対象範囲が変わります。",
  "ret": null,
  "ex": "getStatistics(area, mean, min, max, std);\nprint(mean, std);",
  "note": "値は戻り値ではなく、引数の変数に書き込まれます。後ろの引数は途中から省略できます。空間校正済みの画像では、area は物理単位になります。",
  "ver": null
 },
 {
  "name": "getRawStatistics",
  "sig": "getRawStatistics(nPixels, mean, min, max, std, histogram)",
  "cat": "measure",
  "desc": "アクティブ画像（選択があればその範囲）の統計量を、校正されていない生の値で変数に書き込みます。getStatistics との違いは2つあります。値が未校正で返ることと、16-bit画像のヒストグラムがビン幅1で返ることです。",
  "ret": null,
  "ex": "getRawStatistics(n, mean, min, max, std, hist);\nprint(mean);",
  "note": "引数はすべて書き込み先の変数名で、後ろの引数は途中から省略できます。校正済みの値が欲しい場合は getStatistics を使います。",
  "ver": null
 },
 {
  "name": "Stack.getStatistics",
  "sig": "Stack.getStatistics(voxelCount, mean, min, max, stdDev)",
  "cat": "measure",
  "desc": "スタック全体の統計量（ボクセル数、平均、最小、最大、標準偏差）を計算し、指定した変数に書き込みます。1枚分ではなく、スタックの全スライスを通した集計です。",
  "ret": null,
  "ex": "Stack.getStatistics(n, mean, min, max, std);\nprint(mean);",
  "note": "引数はすべて書き込み先の変数名です。1枚の統計には getStatistics、未校正の1枚分には getRawStatistics を使います。",
  "ver": null
 },
 {
  "name": "getHistogram",
  "sig": "getHistogram(values, counts, nBins[, histMin, histMax])",
  "cat": "measure",
  "desc": "アクティブ画像（選択があればその範囲）のヒストグラムを計算し、階級値の配列と度数の配列を変数に書き込みます。8bit画像とRGB画像では、nBins は 256 でなければなりません。自分で分布を集計・出力したいときに使います。",
  "ret": null,
  "ex": "getHistogram(vals, counts, 256);\nprint(counts[0]);",
  "note": "values と counts は書き込み先の変数名です（values が不要なら 0 を渡せます）。histMin, histMax による階級範囲の指定は、16bit・32bit 画像でのみ有効で、省略できます。",
  "ver": null
 },
 {
  "name": "setThreshold",
  "sig": "setThreshold(lower, upper)",
  "cat": "image",
  "desc": "アクティブ画像の閾値の下限と上限を、数値で設定します。GUIのThreshold操作を数値で再現できます。条件を固定して二値化を自動化する際の中心になります。第3引数で表示方法も指定できます。",
  "ret": null,
  "ex": "setThreshold(50, 200);",
  "note": "第3引数には \"red\"、\"black & white\"、\"over/under\"、\"no color\"、\"raw\" を指定できます。密度キャリブレーション済みの画像では、原則としてキャリブレーション後の値で指定します。",
  "ver": null
 },
 {
  "name": "getThreshold",
  "sig": "getThreshold(lower, upper)",
  "cat": "image",
  "desc": "現在設定されている閾値の下限と上限を、指定した2つの変数に書き込みます。手作業で決めた閾値を読み取って、記録やマクロ化をするために使います。",
  "ret": null,
  "ex": "getThreshold(lo, hi);\nprint(lo, hi);",
  "note": "閾値が設定されていない画像では、両方の変数に -1 が入ります。",
  "ver": null
 },
 {
  "name": "resetThreshold",
  "sig": "resetThreshold",
  "cat": "image",
  "desc": "アクティブ画像の閾値設定を解除します。括弧は省略できます。resetThreshold() と書いても同じです。",
  "ret": null,
  "ex": "resetThreshold;",
  "note": null,
  "ver": null
 },
 {
  "name": "setAutoThreshold",
  "sig": "setAutoThreshold(method)",
  "cat": "image",
  "desc": "指定した自動閾値法（\"Otsu\" や \"Huang\" など）で、アクティブ画像の閾値を設定します。手法名は文字列で渡します。",
  "ret": null,
  "ex": "setAutoThreshold(\"Otsu dark\");",
  "note": "利用できる手法名の一覧は getList(\"threshold.methods\") で取得できます。",
  "ver": null
 },
 {
  "name": "getProfile",
  "sig": "getProfile()",
  "cat": "measure",
  "desc": "直線・折れ線または矩形の選択に沿った、画素値プロファイルを配列で返します。直線なら線上の値、矩形なら各 x 位置で縦方向に平均した値が要素になります。ラインプロファイル解析の基本関数です。",
  "ret": "画素値の配列",
  "ex": "prof = getProfile();\nArray.print(prof);",
  "note": "プロットウィンドウは表示されず、値の配列だけが返ります。直線系または矩形の選択がないとエラーになります。",
  "ver": null
 },
 {
  "name": "getResult",
  "sig": "getResult(\"Column\", row)",
  "cat": "measure",
  "desc": "結果表（Results テーブル）の、指定した列・行の数値を返します。列名は \"Area\"、\"Mean\" のような見出し文字列で、行は0始まりです。2番目の引数を省略すると、最終行が対象になります。",
  "ret": "セルの数値",
  "ex": "a = getResult(\"Area\", 0);",
  "note": "文字列のセルには getResultString を使います。存在しない列名を指定してもエラーにはならず、NaN が返ります。そのため isNaN で確かめます。行番号が範囲外のときはエラーになります。",
  "ver": null
 },
 {
  "name": "getResultLabel",
  "sig": "getResultLabel(row)",
  "cat": "measure",
  "desc": "結果表の指定した行のラベル（通常は元画像名や ROI 名）を、文字列で返します。行と画像・ROI の対応付けに使います。",
  "ret": "行ラベル（文字列）",
  "ex": "label = getResultLabel(0);",
  "note": null,
  "ver": null
 },
 {
  "name": "nResults",
  "sig": "nResults",
  "cat": "measure",
  "desc": "結果表の現在の行数を返します。定義済み変数として働くため、括弧は省略できます。結果を全行ループする際の上限に使います。",
  "ret": "結果表の行数",
  "ex": "for (r = 0; r < nResults; r++) { }",
  "note": "括弧を付けても同じです。",
  "ver": null
 },
 {
  "name": "setResult",
  "sig": "setResult(\"Column\", row, value)",
  "cat": "measure",
  "desc": "結果表の指定した列・行に値を書き込みます。存在しない列名なら列が新規に追加されます。row に nResults を指定すると、行が追加されます。数値のほか文字列も書けます。",
  "ret": null,
  "ex": "setResult(\"Ratio\", 0, 1.25);\nupdateResults();",
  "note": "書いただけでは画面に反映されない場合があるため、最後に updateResults() を呼びます。Label 列には行ラベルを設定できます。",
  "ver": null
 },
 {
  "name": "updateResults",
  "sig": "updateResults()",
  "cat": "measure",
  "desc": "setResult などで変更した結果表の内容を、Results ウィンドウの表示に反映します。表を書き換える処理の締めに呼びます。",
  "ret": null,
  "ex": "setResult(\"Note\", 0, \"ok\");\nupdateResults();",
  "note": null,
  "ver": null
 },
 {
  "name": "getSliceNumber",
  "sig": "getSliceNumber()",
  "cat": "stack",
  "desc": "アクティブなスタックで、現在表示されているスライスの番号を返します（1始まり）。単一画像では 1 を返します。全スライスを巡回するループの状態確認に使います。",
  "ret": "現在のスライス番号（1始まり）",
  "ex": "z = getSliceNumber();",
  "note": "チャンネルやフレームの位置は含みません。ハイパースタックでは Stack.getPosition を使います。",
  "ver": null
 },
 {
  "name": "setSlice",
  "sig": "setSlice(n)",
  "cat": "stack",
  "desc": "アクティブなスタックの表示スライスを、n 番目（1始まり）に切り替えます。対象がスタックでない場合は何もしません。スライスごとに測定や抽出を行うループで使います。",
  "ret": null,
  "ex": "for (z = 1; z <= nSlices; z++) { setSlice(z); }",
  "note": "ハイパースタックの位置指定には、Stack.setPosition の方が確実です。",
  "ver": null
 },
 {
  "name": "nSlices",
  "sig": "nSlices",
  "cat": "stack",
  "desc": "アクティブなスタックのスライス総数を返します。定義済み変数として働くため、括弧は省略できます。単一画像では 1 になります。",
  "ret": "スライス数",
  "ex": "for (z = 1; z <= nSlices; z++) { }",
  "note": "ハイパースタックでは、チャンネル×スライス×フレームの総数になる点に注意してください。内訳は getDimensions で確認します。",
  "ver": null
 },
 {
  "name": "Stack.getDimensions",
  "sig": "Stack.getDimensions(width, height, channels, slices, frames)",
  "cat": "stack",
  "desc": "ハイパースタックとして、現在の画像の次元サイズを指定した変数に書き込みます。getDimensions と同じ情報を、Stack 名前空間で提供する関数です。",
  "ret": null,
  "ex": "Stack.getDimensions(w, h, ch, sl, fr);",
  "note": "引数はすべて書き込み先の変数名です。",
  "ver": null
 },
 {
  "name": "Stack.getPosition",
  "sig": "Stack.getPosition(channel, slice, frame)",
  "cat": "stack",
  "desc": "ハイパースタックの現在位置（チャンネル、スライス、フレームの各番号）を、指定した変数に書き込みます。表示中の位置を記録して、後で復元したいときに使います。",
  "ret": null,
  "ex": "Stack.getPosition(c, z, t);",
  "note": "引数はすべて書き込み先の変数名です。各番号は1始まりです。",
  "ver": null
 },
 {
  "name": "Stack.setPosition",
  "sig": "Stack.setPosition(channel, slice, frame)",
  "cat": "stack",
  "desc": "ハイパースタックの表示位置を、チャンネル・スライス・フレームの番号（いずれも1始まり）で指定して切り替えます。次元ごとに、処理対象を正確に選べます。",
  "ret": null,
  "ex": "Stack.setPosition(2, 5, 1);",
  "note": null,
  "ver": null
 },
 {
  "name": "open",
  "sig": "open(path)",
  "cat": "file",
  "desc": "指定したパスの画像やテキストファイルを開きます。パスを空文字列にすると、ファイル選択ダイアログが表示されます。対応形式は、ImageJ が読めるもの全般です。",
  "ret": null,
  "ex": "open(\"/data/sample.tif\");",
  "note": "開いた画像がアクティブになります。存在しないパスではエラーで止まるため、事前に File.exists で確認すると安全です。",
  "ver": null
 },
 {
  "name": "saveAs",
  "sig": "saveAs(format, path)",
  "cat": "file",
  "desc": "アクティブ画像を、指定した形式で保存します。format には \"Tiff\"、\"PNG\"、\"Jpeg\" などの形式名を指定します。path を省略すると、保存ダイアログが出ます。結果表などの保存にも使える形式があります。",
  "ret": null,
  "ex": "saveAs(\"Tiff\", \"/data/out/result.tif\");",
  "note": "\"Jpeg\" は非可逆圧縮で画素値が変わるため、解析用データの保存には \"Tiff\" を使います。",
  "ver": null
 },
 {
  "name": "getFileList",
  "sig": "getFileList(directory)",
  "cat": "file",
  "desc": "指定したディレクトリ内の、ファイル名とサブディレクトリ名の一覧を、文字列の配列で返します。フォルダ内の一括処理の入り口になる関数です。",
  "ret": "ファイル名の配列",
  "ex": "files = getFileList(dir);\nfor (i = 0; i < files.length; i++) { }",
  "note": "サブディレクトリ名は、末尾に \"/\" が付いて含まれます。拡張子でふるい分けてから開くのが定石です。",
  "ver": null
 },
 {
  "name": "getDirectory",
  "sig": "getDirectory(string)",
  "cat": "file",
  "desc": "引数の文字列をタイトルとしてフォルダ選択ダイアログを表示し、選ばれたフォルダのパスを返します。\"plugins\" や \"home\" など所定のキーワードを渡すと、ダイアログを出さずに、その場所のパスを返します。",
  "ret": "末尾に区切り文字（/ または \\）が付いたフォルダのパス（文字列）",
  "ex": "dir = getDirectory(\"画像フォルダを選んでください\");",
  "note": "返るパスの末尾には区切り文字が付くため、ファイル名をそのまま連結できます。",
  "ver": null
 },
 {
  "name": "close",
  "sig": "close()",
  "cat": "file",
  "desc": "アクティブな画像を閉じます。Log や Results などのウィンドウを誤って閉じることがないのが利点です。引数にタイトルのパターンを渡すと、一致するウィンドウを閉じられます。",
  "ret": null,
  "ex": "close();",
  "note": "close(\"*\") で開いている全画像を、close(\"\\Others\") で最前面以外の画像を閉じます。画像以外のウィンドウは run(\"Close\") で閉じます。",
  "ver": null
 },
 {
  "name": "getArgument",
  "sig": "getArgument()",
  "cat": "file",
  "desc": "マクロが引数付きで呼ばれたときに、その引数文字列を返します。runMacro の第2引数や、プラグイン経由の起動で渡された文字列を受け取るための関数です。引数がなければ空文字列になります。",
  "ret": "渡された引数（文字列）",
  "ex": "arg = getArgument();",
  "note": null,
  "ver": null
 },
 {
  "name": "File.open",
  "sig": "File.open(path)",
  "cat": "file",
  "desc": "テキストファイルを書き込み用に開き、ファイル変数を返します。print にそのファイル変数を渡すと、ログ画面ではなくファイルへ出力できます。開けるファイルは同時に1つだけです。",
  "ret": "ファイル変数",
  "ex": "f = File.open(\"/data/log.txt\");\nprint(f, \"header\");",
  "note": "ファイルはマクロ終了時に自動で閉じられます。開いている間は、別のファイルを開けません。",
  "ver": null
 },
 {
  "name": "File.append",
  "sig": "File.append(string, path)",
  "cat": "file",
  "desc": "指定したテキストファイルの末尾に、文字列を追記します（末尾に改行が付きます）。ファイルがなければ新規に作成されます。処理ログを蓄積する用途に向いています。",
  "ret": null,
  "ex": "File.append(\"done: \" + name, \"/data/log.txt\");",
  "note": "1回ごとに開いて閉じるため、大量の行を書く用途には File.open の方が向いています。",
  "ver": null
 },
 {
  "name": "File.exists",
  "sig": "File.exists(path)",
  "cat": "file",
  "desc": "指定したパスのファイルやディレクトリが存在するかどうかを返します。開く前の存在確認や、上書き防止の分岐に使います。",
  "ret": "存在すれば真（1）、なければ偽（0）",
  "ex": "if (File.exists(path)) open(path);",
  "note": "File 系の関数の多くは文字列を返しますが、File.exists は代入文（e = File.exists(path);）では数値として扱われます。if 文の条件にそのまま書けます。",
  "ver": null
 },
 {
  "name": "showMessage",
  "sig": "showMessage(title, message)",
  "cat": "dialog",
  "desc": "メッセージをダイアログボックスで表示し、OK が押されるまで処理を止めます。タイトルを省略した1引数形式もあります。HTML 形式のテキストも表示できます。",
  "ret": null,
  "ex": "showMessage(\"完了\", \"処理が終わりました\");",
  "note": "バッチ処理の途中では毎回止まってしまうため、無人実行では print や showStatus に切り替えます。",
  "ver": null
 },
 {
  "name": "showStatus",
  "sig": "showStatus(message)",
  "cat": "dialog",
  "desc": "ImageJ のステータスバーにメッセージを表示します。処理を止めずに進捗や状態を伝えるための表示で、一時的な通知に向いています。",
  "ret": null,
  "ex": "showStatus(\"処理中: \" + i + \"/\" + n);",
  "note": "メッセージが \"!\" で始まると、以後のプロセスメッセージ表示が抑制されます。",
  "ver": null
 },
 {
  "name": "showProgress",
  "sig": "showProgress(progress)",
  "cat": "dialog",
  "desc": "プログレスバーを更新します。引数は 0.0 から 1.0 の進捗率です。処理件数と総数から割合を渡す2引数形式もあります。長時間ループの進捗表示に使います。",
  "ret": null,
  "ex": "showProgress(i, n);",
  "note": "1.0 以上になるとバーは消えます。呼び出し間隔が極端に短いと、表示されないことがあります。",
  "ver": null
 },
 {
  "name": "waitForUser",
  "sig": "waitForUser(title, message)",
  "cat": "dialog",
  "desc": "ダイアログを出してマクロを一時停止し、ユーザーの手作業を待ちます。OK で再開し、Cancel でマクロが中止されます。ダイアログはモーダルではないため、表示中も選択の作成やしきい値調整ができます。",
  "ret": null,
  "ex": "waitForUser(\"確認\", \"ROIを調整してOKを押してください\");",
  "note": "引数なし形式や1引数形式もあります。手作業を挟む半自動処理の要になる関数です。",
  "ver": null
 },
 {
  "name": "getNumber",
  "sig": "getNumber(prompt, defaultValue)",
  "cat": "dialog",
  "desc": "数値入力用のダイアログを表示し、入力された数値を返します。prompt はダイアログに表示する説明文、defaultValue は初期値です。",
  "ret": "入力された数値",
  "ex": "r = getNumber(\"半径:\", 10);",
  "note": "キャンセルするとマクロは中止されます。複数の設定をまとめて聞く場合は、Dialog 系の関数を使います。",
  "ver": null
 },
 {
  "name": "getString",
  "sig": "getString(prompt, defaultString)",
  "cat": "dialog",
  "desc": "文字列入力用のダイアログを表示し、入力された文字列を返します。prompt はダイアログに表示する説明文、defaultString は初期値です。",
  "ret": "入力された文字列",
  "ex": "name = getString(\"名前:\", \"sample\");",
  "note": "キャンセルするとマクロは中止されます。",
  "ver": null
 },
 {
  "name": "Dialog.create",
  "sig": "Dialog.create(title)",
  "cat": "dialog",
  "desc": "汎用ダイアログの構築を開始します。この後、Dialog.add 系で入力欄を追加し、Dialog.show で表示します。引数はダイアログのタイトルです。",
  "ret": null,
  "ex": "Dialog.create(\"条件設定\");\nDialog.addNumber(\"半径:\", 10);\nDialog.show();",
  "note": null,
  "ver": null
 },
 {
  "name": "Dialog.addNumber",
  "sig": "Dialog.addNumber(label, default)",
  "cat": "dialog",
  "desc": "構築中のダイアログに、数値入力欄を追加します。label は欄の左に表示される文字列、default は初期値です。入力された値は Dialog.getNumber で取り出します。",
  "ret": null,
  "ex": "Dialog.addNumber(\"半径:\", 10);",
  "note": "追加した順に値を取得する決まりなので、追加順と取得順を揃えます。",
  "ver": null
 },
 {
  "name": "Dialog.addString",
  "sig": "Dialog.addString(label, initialText)",
  "cat": "dialog",
  "desc": "構築中のダイアログに、文字列入力欄を追加します。label は表示ラベル、initialText は初期文字列です。値は Dialog.getString で取り出します。",
  "ret": null,
  "ex": "Dialog.addString(\"名前:\", \"sample\");",
  "note": null,
  "ver": null
 },
 {
  "name": "Dialog.addChoice",
  "sig": "Dialog.addChoice(label, items)",
  "cat": "dialog",
  "desc": "構築中のダイアログに、ドロップダウン式の選択欄を追加します。items は選択肢の文字列配列です。第3引数 default を省略すると、先頭の要素が既定の選択になります。選ばれた値は Dialog.getChoice で取り出します。",
  "ret": null,
  "ex": "Dialog.addChoice(\"方法:\", newArray(\"A\", \"B\"));",
  "note": null,
  "ver": null
 },
 {
  "name": "Dialog.show",
  "sig": "Dialog.show()",
  "cat": "dialog",
  "desc": "構築したダイアログを表示し、ユーザーの入力を待ちます。Cancel が押されるとマクロは中止されます。入力値の取得は、この後に Dialog.get 系で行います。",
  "ret": null,
  "ex": "Dialog.show();\nr = Dialog.getNumber();",
  "note": null,
  "ver": null
 },
 {
  "name": "Dialog.getNumber",
  "sig": "Dialog.getNumber()",
  "cat": "dialog",
  "desc": "表示したダイアログで入力された数値を、追加した順に1つずつ取り出します。数値欄だけでなく、スライダー付き欄の値もこれで取ります。",
  "ret": "入力された数値",
  "ex": "r = Dialog.getNumber();",
  "note": "取得順は、Dialog.addNumber などで追加した順番と一致させる必要があります。",
  "ver": null
 },
 {
  "name": "Dialog.getString",
  "sig": "Dialog.getString()",
  "cat": "dialog",
  "desc": "表示したダイアログの文字列欄（Dialog.addString など）に入力された文字列を、追加した順に1つずつ取り出します。選択欄（Dialog.addChoice）の値は Dialog.getChoice で取り出します。",
  "ret": "入力された文字列",
  "ex": "name = Dialog.getString();",
  "note": null,
  "ver": null
 },
 {
  "name": "Dialog.getChoice",
  "sig": "Dialog.getChoice()",
  "cat": "dialog",
  "desc": "表示したダイアログの選択欄（Dialog.addChoice）で選ばれた項目を、追加した順に1つずつ文字列で取り出します。選択欄が複数あれば、呼ぶたびに次の選択欄の値が返ります。",
  "ret": "選ばれた項目（文字列）",
  "ex": "Dialog.create(\"条件設定\");\nDialog.addChoice(\"方法:\", newArray(\"Otsu\", \"Huang\"));\nDialog.show();\nm = Dialog.getChoice();",
  "note": "取得順は、Dialog.addChoice で追加した順番と一致させます。",
  "ver": null
 },
 {
  "name": "lengthOf",
  "sig": "lengthOf(str)",
  "cat": "string",
  "desc": "文字列の長さ（文字数）を返します。配列を渡すと、その要素数を返します。そのため、配列の長さ取得にも使われます。",
  "ret": "文字数、または配列の要素数",
  "ex": "n = lengthOf(name);\nm = lengthOf(arr);",
  "note": null,
  "ver": null
 },
 {
  "name": "substring",
  "sig": "substring(string, index1, index2)",
  "cat": "string",
  "desc": "文字列の一部を取り出します。index1 の位置から index2 の直前までの部分文字列を返します。第3引数を省略すると、index1 から末尾までになります。位置は0始まりです。",
  "ret": "部分文字列",
  "ex": "s = substring(\"sample_01.tif\", 0, 6);",
  "note": "index2 が指す文字自体は含まれません。",
  "ver": null
 },
 {
  "name": "indexOf",
  "sig": "indexOf(string, substring)",
  "cat": "string",
  "desc": "文字列の中で、部分文字列が最初に現れる位置を返します（0始まり）。見つからなければ -1 です。キーワードの有無判定や、分割位置の決定に使います。",
  "ret": "出現位置（見つからなければ -1）",
  "ex": "p = indexOf(name, \"_\");",
  "note": null,
  "ver": null
 },
 {
  "name": "startsWith",
  "sig": "startsWith(string, prefix)",
  "cat": "string",
  "desc": "文字列が、指定した接頭辞で始まるかどうかを返します。ファイル名の分類など、条件分岐によく使います。",
  "ret": "始まれば 1（true）、そうでなければ 0（false）",
  "ex": "if (startsWith(name, \"ctrl\")) { }",
  "note": "対になる endsWith(string, suffix) もあります。",
  "ver": null
 },
 {
  "name": "endsWith",
  "sig": "endsWith(string, suffix)",
  "cat": "string",
  "desc": "文字列が、指定した接尾辞（suffix）で終わるかどうかを調べます。拡張子でファイルを振り分けるときなどに使います。",
  "ret": "終われば 1、終わらなければ 0",
  "ex": "if (endsWith(name, \".tif\")) print(\"TIFF\");",
  "note": null,
  "ver": null
 },
 {
  "name": "replace",
  "sig": "replace(string, old, new)",
  "cat": "string",
  "desc": "文字列の中の old を new に置き換えた、新しい文字列を返します。old が1文字のときはその文字の置換になります。2文字以上のときは、正規表現として扱われます。",
  "ret": "置換後の文字列",
  "ex": "s = replace(name, \" \", \"_\");",
  "note": "正規表現として解釈されるため、ドットなどの記号を文字として置換したい場合はエスケープが必要です。",
  "ver": null
 },
 {
  "name": "split",
  "sig": "split(string, delimiters)",
  "cat": "string",
  "desc": "文字列を区切り文字で分割し、部分文字列の配列を返します。区切りは複数文字の集合として指定できます。省略時は、空白・タブ・改行が区切りになります。",
  "ret": "部分文字列の配列",
  "ex": "parts = split(name, \"_\");",
  "note": "区切りに \",\"、\";\"、\"\\n\" を単独で使うと、空文字列が混ざることがあります。\",,\"、\";;\"、\"\\n\\n\" のように重ねると避けられます。",
  "ver": null
 },
 {
  "name": "d2s",
  "sig": "d2s(n, decimalPlaces)",
  "cat": "string",
  "desc": "数値を、小数点以下の桁数を指定して文字列に変換します。表示やファイル出力で桁数を揃えたいときに使います。桁数の指定により丸めが行われます。",
  "ret": "整形された文字列",
  "ex": "s = d2s(mean, 3);",
  "note": "decimalPlaces に 0 を与えると、四捨五入した整数の表記（例 d2s(5.5, 0) は \"6\"）になります。負の値を与えると指数表記になります。",
  "ver": null
 },
 {
  "name": "parseInt",
  "sig": "parseInt(string)",
  "cat": "string",
  "desc": "文字列を整数として解釈して返します。第2引数で基数（進数）を指定することもできます。数値として読めない文字列では NaN になります。",
  "ret": "整数値",
  "ex": "n = parseInt(\"42\");",
  "note": null,
  "ver": null
 },
 {
  "name": "parseFloat",
  "sig": "parseFloat(string)",
  "cat": "string",
  "desc": "文字列を浮動小数点数として解釈して返します。ファイルから読み込んだ数値文字列の変換に使います。読めない文字列では NaN になります。",
  "ret": "浮動小数点数",
  "ex": "v = parseFloat(\"3.14\");",
  "note": null,
  "ver": null
 },
 {
  "name": "newArray",
  "sig": "newArray(size)",
  "cat": "string",
  "desc": "配列を作成します。数値を1つだけ渡すと、その数を要素数とする配列（各要素は 0）になります。値を複数並べると、それらを要素とする配列になります。数値でも文字列でも並べられます。",
  "ret": "新しい配列",
  "ex": "a = newArray(10);\nb = newArray(\"x\", \"y\");",
  "note": "newArray(5) は「要素数 5 の配列」であり、5 を1つ持つ配列ではありません。ImageJ 1.53g 以降は、配列が必要に応じて自動的に拡張されます。",
  "ver": null
 },
 {
  "name": "Array.sort",
  "sig": "Array.sort(array)",
  "cat": "string",
  "desc": "配列をその場で並べ替えます。数値配列は数値順に、文字列配列は大文字小文字を区別しない順序でソートされます。元の配列自体が書き換わります。",
  "ret": null,
  "ex": "Array.sort(values);",
  "note": "元の順序が必要な場合は、Array.copy で複製してからソートします。",
  "ver": null
 },
 {
  "name": "Array.copy",
  "sig": "Array.copy(array)",
  "cat": "string",
  "desc": "配列の複製を返します。複製は元の配列とは独立しています。一方を変更しても、他方に影響しません。Array.sort のように元の配列を書き換える処理の前に使います。",
  "ret": "複製された配列",
  "ex": "b = Array.copy(a);\nArray.sort(b);",
  "note": null,
  "ver": null
 },
 {
  "name": "Array.getStatistics",
  "sig": "Array.getStatistics(array, min, max, mean, stdDev)",
  "cat": "string",
  "desc": "配列の統計量を計算し、最小・最大・平均・標準偏差を、指定した変数に書き込みます。測定値の集まりを要約したいときに使います。",
  "ret": null,
  "ex": "Array.getStatistics(vals, mn, mx, mean, sd);\nprint(mean, sd);",
  "note": "後ろの引数は途中から省略できます。その場合は、先行する変数までが書き込まれます。",
  "ver": null
 },
 {
  "name": "abs",
  "sig": "abs(n)",
  "cat": "math",
  "desc": "絶対値を返します。差分の大きさだけを比べたい場合などに使う基本関数です。",
  "ret": "n の絶対値",
  "ex": "d = abs(a - b);",
  "note": null,
  "ver": null
 },
 {
  "name": "Math.min",
  "sig": "Math.min(n1, n2)",
  "cat": "math",
  "desc": "2つの数値のうち小さい方を返します。Math 名前空間の関数です。単独の min 関数は存在しない点に注意してください。",
  "ret": "小さい方の値",
  "ex": "m = Math.min(a, b);",
  "note": "旧来の minOf(n1, n2) も同じ目的で使えます。",
  "ver": "1.52u以降"
 },
 {
  "name": "Math.max",
  "sig": "Math.max(n1, n2)",
  "cat": "math",
  "desc": "2つの数値のうち大きい方を返します。Math 名前空間の関数です。単独の max 関数は存在しない点に注意してください。",
  "ret": "大きい方の値",
  "ex": "m = Math.max(a, b);",
  "note": "旧来の maxOf(n1, n2) も同じ目的で使えます。",
  "ver": "1.52u以降"
 },
 {
  "name": "minOf",
  "sig": "minOf(n1, n2)",
  "cat": "math",
  "desc": "2つの数値のうち小さい方を返します。Math.min と同じ目的で使える、旧来の関数です。",
  "ret": "小さい方の値",
  "ex": "m = minOf(a, b);",
  "note": "単独の min 関数は存在しません。3つ以上の比較は入れ子にするか、Math.min と組み合わせます。",
  "ver": null
 },
 {
  "name": "maxOf",
  "sig": "maxOf(n1, n2)",
  "cat": "math",
  "desc": "2つの数値のうち大きい方を返します。Math.max と同じ目的で使える、旧来の関数です。",
  "ret": "大きい方の値",
  "ex": "m = maxOf(a, b);",
  "note": "単独の max 関数は存在しません。",
  "ver": null
 },
 {
  "name": "isNaN",
  "sig": "isNaN(n)",
  "cat": "math",
  "desc": "値が NaN（非数）かどうかを返します。存在しない列名での getResult や、読めない文字列の parseInt のように、NaN が返りうる処理の結果判定に使います。",
  "ret": "NaN なら 1、そうでなければ 0",
  "ex": "v = getResult(\"Mean\", 0);\nif (isNaN(v)) print(\"値がありません\");",
  "note": null,
  "ver": null
 },
 {
  "name": "pow",
  "sig": "pow(base, exponent)",
  "cat": "math",
  "desc": "累乗を計算し、base の exponent 乗を返します。二乗や平方根の逆演算などの計算に使います。",
  "ret": "base^exponent",
  "ex": "y = pow(x, 2);",
  "note": null,
  "ver": null
 },
 {
  "name": "sqrt",
  "sig": "sqrt(n)",
  "cat": "math",
  "desc": "平方根を返します。負の数を渡すと NaN になります。",
  "ret": "n の平方根",
  "ex": "r = sqrt(2);",
  "note": null,
  "ver": null
 },
 {
  "name": "exp",
  "sig": "exp(n)",
  "cat": "math",
  "desc": "自然指数関数 e の n 乗を返します。指数減衰・増殖のモデル計算などに使います。",
  "ret": "e^n",
  "ex": "y = exp(-x);",
  "note": null,
  "ver": null
 },
 {
  "name": "log",
  "sig": "log(n)",
  "cat": "math",
  "desc": "自然対数（底 e）を返します。常用対数が必要な場合は Math.log10 を使います。",
  "ret": "ln(n)",
  "ex": "y = log(x);",
  "note": "対数の底は e です。10 を底にしたい場合と取り違えないでください。",
  "ver": null
 },
 {
  "name": "atan2",
  "sig": "atan2(y, x)",
  "cat": "math",
  "desc": "y/x の逆正接を、象限を考慮して -π から π の範囲で返します。2点間の角度を求める処理で、単なる atan では得られない向きの情報が得られます。",
  "ret": "角度（ラジアン）",
  "ex": "ang = atan2(dy, dx);",
  "note": "引数の順序は (y, x) です。度に直すには *180/PI を掛けます。",
  "ver": null
 },
 {
  "name": "round",
  "sig": "round(n)",
  "cat": "math",
  "desc": "最も近い整数に丸めて返します。四捨五入の役割を持ちます。",
  "ret": "丸めた整数",
  "ex": "r = round(2.5); // 3",
  "note": null,
  "ver": null
 },
 {
  "name": "floor",
  "sig": "floor(n)",
  "cat": "math",
  "desc": "n 以下の最大の整数を返します（切り捨て）。負数では、0 の方向ではなく小さい側に丸められます。",
  "ret": "切り捨てた整数",
  "ex": "f = floor(2.9); // 2",
  "note": "切り上げは Math.ceil を使います。",
  "ver": null
 },
 {
  "name": "Math.ceil",
  "sig": "Math.ceil(n)",
  "cat": "math",
  "desc": "n 以上の最小の整数を返します（切り上げ）。Math 名前空間の関数で、単独の ceil 関数は存在しません。",
  "ret": "切り上げた整数",
  "ex": "c = Math.ceil(2.1); // 3",
  "note": "切り捨ては floor を使います。",
  "ver": null
 },
 {
  "name": "random",
  "sig": "random()",
  "cat": "math",
  "desc": "0 以上 1 未満の一様乱数を返します。引数に \"gaussian\" を渡すと正規分布の乱数を、\"seed\" と種を渡すと乱数系列を再現可能にできます。",
  "ret": "乱数",
  "ex": "r = random();\ng = random(\"gaussian\");",
  "note": "括弧を付けずに random と書く書き方も、公式に認められています。",
  "ver": null
 },
 {
  "name": "run",
  "sig": "run(command, options)",
  "cat": "control",
  "desc": "メニューコマンドやプラグインを、名前で実行します。ImageJ の処理の大部分は、この関数経由で呼び出されます。第2引数の options には、ダイアログ設定値の文字列を渡せます。省略もできます。",
  "ret": null,
  "ex": "run(\"Measure\");\nrun(\"Gaussian Blur...\", \"sigma=2\");",
  "note": "コマンド名の末尾の \"...\" の有無や、options の書式はコマンドごとに決まっています。マクロレコーダーの記録が、最も確実な手本になります。",
  "ver": null
 },
 {
  "name": "runMacro",
  "sig": "runMacro(name, arg)",
  "cat": "control",
  "desc": "macros フォルダ内のファイル名、またはフルパスで指定したマクロ（スクリプト）ファイルを実行します。第2引数で文字列を渡すことができます。呼び先では getArgument で受け取ります。",
  "ret": "呼び出したマクロが返した文字列",
  "ex": "result = runMacro(\"SubTask\", \"123\");",
  "note": "コードの文字列をその場で実行したい場合は eval を使います。",
  "ver": null
 },
 {
  "name": "eval",
  "sig": "eval(macroCode)",
  "cat": "control",
  "desc": "文字列として与えたマクロコードを、その場で実行します。第1引数に \"js\" などを指定すると、第2引数の JavaScript などのスクリプトを評価できます。動的に組み立てたコードを実行する、特殊な用途の関数です。",
  "ret": "評価したコードが返した文字列（\"js\" などでは最後の文の値）",
  "ex": "eval(\"print(getWidth());\");",
  "note": "通常の処理では使わず、コードの動的生成が本当に必要な場合に限ります。",
  "ver": null
 },
 {
  "name": "setBatchMode",
  "sig": "setBatchMode(true)",
  "cat": "control",
  "desc": "バッチモードの入り切りを切り替えます。true にすると画像ウィンドウを表示せずに処理するため、高速化できます。一括処理の定番設定になります。",
  "ret": null,
  "ex": "setBatchMode(true);\n// 一括処理\nsetBatchMode(false);",
  "note": "公式ドキュメントによれば、false でバッチモードを抜けると、アクティブ画像以外の隠れた画像は破棄されます。マクロ終了時にも、隠れた画像は破棄されます。表示して確認したい中間結果は残りません。",
  "ver": null
 },
 {
  "name": "exit",
  "sig": "exit(message)",
  "cat": "control",
  "desc": "マクロの実行を即座に終了します。引数に文字列を渡すと、そのメッセージがエラーダイアログとして表示されます。前提条件を満たさない場合の打ち切りに使います。",
  "ret": null,
  "ex": "if (nImages == 0) exit(\"画像が開かれていません\");",
  "note": "関数の中で呼んでも、マクロ全体が終了します。",
  "ver": null
 },
 {
  "name": "print",
  "sig": "print(arg1, arg2, ...)",
  "cat": "control",
  "desc": "Log ウィンドウに値を出力します。複数の引数は区切られて並びます。ファイル変数を第1引数にすると、ファイルへ出力します。数値と文字列を混ぜて出せます。",
  "ret": null,
  "ex": "print(\"mean =\", mean);",
  "note": "Log は画面表示用です。処理結果を残すなら、File 系と併用します。",
  "ver": null
 },
 {
  "name": "setOption",
  "sig": "setOption(option, boolean)",
  "cat": "control",
  "desc": "ImageJ の各種オプションを名前指定で有効化・無効化します。たとえば \"BlackBackground\" で、二値画像の背景を黒として扱うかどうかを切り替えるなど、コマンドの既定の挙動をマクロから制御できます。",
  "ret": null,
  "ex": "setOption(\"BlackBackground\", true);",
  "note": "指定できるオプション名は多岐にわたります。ものによっては、必要なバージョンが異なります。設定はコマンドの結果に直結するため、変更したオプションは処理後に戻す配慮が要ります。",
  "ver": null
 },
 {
  "name": "call",
  "sig": "call(\"class.method\", arg1, arg2, ...)",
  "cat": "control",
  "desc": "Java クラスの static メソッドを、クラス名とメソッド名の文字列で直接呼び出します。マクロ関数として用意されていない機能へ到達するための、低レベルな橋渡しです。",
  "ret": "呼び出したメソッドの戻り値（文字列）",
  "ex": "s = call(\"java.lang.System.getProperty\", \"os.name\");",
  "note": "対象クラスの API 知識が前提になる、上級者向けの関数です。",
  "ver": null
 },
 {
  "name": "getVersion",
  "sig": "getVersion()",
  "cat": "control",
  "desc": "実行中の ImageJ のバージョンを、文字列で返します。バージョン依存の分岐や、処理環境の記録に使います。",
  "ret": "バージョン文字列（例: \"1.54f\"）",
  "ex": "print(getVersion());",
  "note": "特定機能の要否判定には、requires の方が直接的です。",
  "ver": null
 },
 {
  "name": "requires",
  "sig": "requires(\"version\")",
  "cat": "control",
  "desc": "マクロの実行に必要な、ImageJ の最低バージョンを宣言します。現在のバージョンが不足していれば、更新を促すメッセージを出してマクロが中止されます。",
  "ret": null,
  "ex": "requires(\"1.53f\");",
  "note": "バージョン文字列は \"1.53f\" のような公式表記で書きます。マクロの先頭に置くのが通例です。",
  "ver": null
 }
];
