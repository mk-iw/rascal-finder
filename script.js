let model, webcam, labelContainer, maxPredictions;
const info = document.getElementById('info');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// モデルのパス（GitHub Pagesで公開した際の相対パス）
const MODEL_URL = "./model/";

async function init() {
    console.log("1: 開始");
    model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
    console.log("2: モデル読み込み完了");

    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    console.log("3: カメラ準備完了");

    video.onloadedmetadata = () => {
        video.play();
        console.log("4: 再生開始");
        requestAnimationFrame(loop);
    };
}

async function loop() {
    await predict();
    requestAnimationFrame(loop);
}

async function predict() {
    // video要素から予測を実行
    const prediction = await model.predict(video);
    
    // 描画処理
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    for (let i = 0; i < maxPredictions; i++) {
        const p = prediction[i];
        if (p.className === "Rascal" && p.probability > 0.85) {
            // ラスカル（学習時のラベル名）の確率が85%を超えたら
            drawHighlight("ラスカル発見！");
        }
    }
}

function drawHighlight(text) {
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    ctx.fillStyle = "#00FF00";
    ctx.font = "bold 80px sans-serif";
    ctx.fillText(text, 100, 150);
}

init();