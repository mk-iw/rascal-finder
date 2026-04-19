// 設定：モデルを配置したフォルダのパス（最後は / で終わる）
const MODEL_URL = "./model/";

let model, video, canvas, ctx, maxPredictions;
const info = document.getElementById('info');

async function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    try {
        console.log("1: 開始");
        info.innerText = "モデル読み込み中...";
        
        // モデルのロード
        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );
        maxPredictions = model.getTotalClasses();
        console.log("2: モデル読み込み完了");

        // カメラの設定
        info.innerText = "カメラ準備中...";
        const constraints = {
            video: { facingMode: "environment" } // 背面カメラ
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        // ビデオが再生可能になったら実行
        video.onloadedmetadata = () => {
            video.play();
            console.log("4: 再生開始");
            info.innerText = "スキャン実行中...";
            requestAnimationFrame(loop);
        };

    } catch (e) {
        console.error(e);
        info.innerText = "エラー: " + e.message;
    }
}

async function loop() {
    await predict();
    requestAnimationFrame(loop);
}

async function predict() {
    if (!model || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // AI判定
    const prediction = await model.predict(video);
    
    // キャンバスのサイズをカメラ映像に合わせる
    if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    // 1. まずカメラ映像を描画
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. 判定結果をループして確認
    let found = false;
    for (let i = 0; i < maxPredictions; i++) {
        const p = prediction[i];
        
        // 確率が85%以上のクラスがあれば表示
        if (p.probability > 0.85) {
            found = true;
            info.innerText = `${p.className}: ${(p.probability * 100).toFixed(0)}%`;
            
            // ★重要：ここをTeachable Machineで設定したラベル名に書き換えてください
            if (p.className === "Rascal" || p.className === "ラスカル") {
                drawHighlight("ラスカル発見！");
            }
        }
    }
    
    if (!found) {
        info.innerText = "スキャン中（対象を探してください）";
    }
}

function drawHighlight(text) {
    // 枠を描く
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 15;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    // 文字を描く
    ctx.fillStyle = "#00FF00";
    ctx.font = `bold ${canvas.width / 15}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// 起動
init();