$(document).ready(function() {
    
    var num = 0,
        n = 0 //num-抽卡代号，n-正位逆位
    var name = new Array("魔术师","死神", "倒吊人", "正义", "审判", "隐者", "力量","女皇", "皇帝","恶魔", "塔")
    var explain0 = new Array(7).fill("不用占卜啦，小马今天最幸运了");
    explain0.push("小马加油！！！", "生活奇奇怪怪，信心百倍迎接","即使今天的天空没有星星，明天太阳依然会升起，照亮你的道路", "没什么大不了，拿得起放得下")
    var explain1 = new Array(7).fill("意思是你要保持开心，what a day!");
    explain1.push("每一次尝试都是向成功迈进的一步，不要因为一次失败而气馁。", "你的微笑比任何语言都更有力量，它会帮你打开新的大门。", "不是所有的花都会在春天开放，但春天总会到来，你的幸福也是。", "有时候，最好的事会在我们最不期待的时候发生")
    function drawCard() {
        $("#explain>p").remove();
        //开始
        num = Math.floor(Math.random() * 11);
        n = Math.floor(Math.random() * 2);
        var newBcg = "./img/" + (num + 1) + ".webp"
        $("#card>img").attr("src", newBcg).css("transform", n === 1 ? "rotate(180deg)" : "");
        
        var explanation = n === 1 ? explain1[num] : explain0[num];
        $("#explain").append('<p>' + name[num] + (n === 1 ? '[逆位]' : '[正位]') + '</p>');
        $("#explain").append('<p>' + explanation + '</p>');
    }

    $("#drawCard").click(drawCard);
})