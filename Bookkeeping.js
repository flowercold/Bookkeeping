// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: light-brown;
// icon-glyph: chart-bar;
//bookkeeping by fonter


// 记账数据配置
const tableConfig = {
  url: "***", // 记账多维表格中的预算数据表，示例是模版，请从模版创建使用 https://dsbp9gf887.feishu.cn/base/ChfTb2Cb9aOA64srKd3c6WrGnCd?table=tblrnc92oom5Imhl&view=vewEYHNnVO
  token: "***", // 多维表格授权码
};

//脚本版本检查
const bnum = 4;
checkAndUpdateVersion(bnum).then(result => {
  if (result === 0) {
    console.log("已更新");
  } else {
    console.log("最新版本");
  }
});
async function checkAndUpdateVersion(currentVersion) {
  const uServer = "https://github.com/flowercold/Bookkeeping/raw/main/VERSION";
  const cServer = "https://github.com/flowercold/Bookkeeping/raw/main/Bookkeeping.js";
  let fm = FileManager.iCloud();
  let minVer = parseInt(await new Request(uServer).loadString());
  console.log("最新版本 " + minVer)

  if (currentVersion < minVer) {
    let code = await new Request(cServer).loadString();
    fm.writeString(fm.joinPath(fm.documentsDirectory(), Script.name() + ".js"), code);
    return 0; // 表示需要更新
  }
  return 1; // 表示不需要更新
}

// 获取本月记账数据
async function extractIds(url) {// 手动解析 URL
  const baseIdMatch = url.match(/base\/([^\/?]+)/);
  const baseId = baseIdMatch ? baseIdMatch[1] : null;
  const tableIdMatch = url.match(/[?&]table=([^&]+)/);
  const tableId = tableIdMatch ? tableIdMatch[1] : null;
  const viewIdMatch = url.match(/[?&]view=([^&]+)/);
  const viewId = viewIdMatch ? viewIdMatch[1] : null;
  return { baseId, tableId, viewId };
}
async function fetchData(url, token) {
  const { baseId, tableId, viewId } = await extractIds(url);
  const apiUrl = `https://base-api.feishu.cn/open-apis/bitable/v1/apps/${baseId}/tables/${tableId}/records?view_id=${viewId}`;
  const req = new Request(apiUrl);
  req.headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  return req.loadJSON();
}
function convertToNumbers(json) {
  if (!json || !json.data || !json.data.items) {
    console.error("Invalid JSON structure:", JSON.stringify(json, null, 2));
    return {
      todayChartValues: 0,
      lineChartValues: [],
      dashedLineChartValues: [],
      barChartValues: []
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  const result = {
    todayChartValues: 0,
    lineChartValues: [],
    dashedLineChartValues: [],
    barChartValues: []
  };

  json.data.items.forEach(item => {
    const { 日期, 累计支出, 预算, 当日支出 } = item.fields;
    result.lineChartValues.push(累计支出);
    result.dashedLineChartValues.push(预算);
    result.barChartValues.push(当日支出);
    if (new Date(日期).getTime() === todayTimestamp) {
      result.todayChartValues = 当日支出;
    }
  });

  return result;
}
const json = await fetchData(tableConfig.url, tableConfig.token);
const { todayChartValues, lineChartValues, dashedLineChartValues, barChartValues } = convertToNumbers(json);

// widget 主题设置
const widget_config = {
  theme: "ilo", // 配置主题名字，random 随机主题
  fixedTime: "",
  background_image: false, // 背景为图片
  backgroundColor: [ // 默认背景色
    "#1c1c1e",
    "#1c1c1e"
  ],
  backgroundColorLight: [],
  backgroundGradientValue: [0.0, 1.0],
  font: "Menlo",
  fontSize: 18,
  textColorHighlighted: "#fefffe",// The color to use for the "highlighted" words.
  textColorHighlightedLight: null,
  textShadowHighlighted: "#fefffe",// The color of the highlighted text shadow
  textShadowHighlightedLight: null,
  textColorBackground: "#404043",// The color of the words that are NOT highlighted
  textColorBackgroundLight: null,
  textShadowHighlightedRadius: 0,// The radius of the highlighted text shadow
  textAlphaBackground: 0.5,// The opacity of the non-highlighted words 1 -> opaque; 0 -> transparent
  spacingBetweenLines: 4.5,// The spacing between the lines of words of the clock
  spacingBetweenWords: 11,// The spacing between each individual word, within the
}
const themes = {
  iosAuto: {
    backgroundColor: ["#1c1c1e", "#1c1c1e",],
    backgroundColorLight: ["#ffffff", "#ffffff",],
    textColorHighlighted: "#fefffe",
    textColorHighlightedLight: "#000000",
    textColorBackground: "#404043",
    textColorBackgroundLight: "#cccccc",
  },
  iosDark: {
    backgroundColor: ["#1c1c1e", "#1c1c1e"],
    textColorHighlighted: "#fefffe",
    textColorBackground: "#404043",
  },
  iosLight: {
    backgroundColor: ["#ffffff", "#ffffff"],
    textColorHighlighted: "#000000",
    textColorBackground: "#cccccc",
  },
  red: {
    backgroundColor: ["#D94036", "#D41F29"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#E2745A",
  },
  ilo: {
    backgroundColor: ["#fff7f2", "#fff7f9"],
    textColorHighlighted: "#c88e69",
    textColorBackground: "#3E3E3E",
  },
  linear: {
    backgroundColor: ["#29349A", "#5F69CA"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#cccccc",
  },
  blue: {
    backgroundColor: ["#00A6D4", "#0093C9"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#65BFDF",
  },
  lime: {
    backgroundColor: ["#D4DA52", "#C8D200"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#D8DD67",
  },
  gold: {
    backgroundColor: ["#E1D2B5", "#A48B66"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#5C5C50",
  },
  yellow: {
    backgroundColor: ["#deb714", "#c39009"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#9d7600",
  },
  vintage: {
    backgroundColor: ["#538687", "#194e56"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#16383d",
  },
  carrotBlue: {
    backgroundColor: ["#0088F4", "#0151E4"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#2284ed",
  },
  apolloPurple: {
    backgroundColor: ["#4981D4", "#6E5DF5"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#848ccc",
  },
  pureBlack: {
    backgroundColor: ["#000000", "#000000"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#151515",
  },
  pureBlackXL: {
    backgroundColor: ["#000000", "#000000"],
    textColorHighlighted: "#FFFFFF",
    textColorBackground: "#151515",
    fontSize: 25,
    spacingBetweenLines: 2.8,
    spacingBetweenWords: 13,
  },
  matrixGreen: {
    backgroundColor: ["#000000", "#000000"],
    textColorHighlighted: "#9DF7A4",
    textColorBackground: "#233E27",
    font: "Courier New",
  },
  /*
  RawIron: {
    textColorHighlighted: "#fefffe",
    textColorBackground: "#696969",
    background_image: "https://qlocktwo.com/pub/media/wysiwyg/timecheck/Q2CE_L_RAW_IRON_frontal_background.png",
    textShadowHighlightedRadius: 0.5,
  },
  VintageCopper: {
    textColorHighlighted: "#fefffe",
    textColorBackground: "#404043",
    background_image: "https://qlocktwo.com/pub/media/wysiwyg/timecheck/Q2CE_VINTAGE_COPPER-web.jpg",
  },
  Metamorphite: {
    textColorHighlighted: "#fefffe",
    textColorBackground: "#696969",
    background_image: "https://qlocktwo.com/pub/media/wysiwyg/timecheck/Q2CE_METAMORPHITE_2019-web.jpg",
  },
  ocean: {
    textColorHighlighted: "#fefffe",
    textColorBackground: "#74BCE1",
    textShadowHighlightedRadius: 0.5,
    background_image: "ocean.jpeg",
  },
  */
};
if (widget_config.theme == "random") {//随机主题
  console.log("random selected")
  var keys = Object.keys(themes)
  widget_config.theme = keys[ Math.floor(Math.random() * keys.length)]
  console.log("random result: " + widget_config.theme)
}
Object.assign(widget_config, themes[widget_config.theme]);
set_colors();
function set_colors(){
  // Background Color
  if (widget_config.backgroundColorLight.length == 0) {
    widget_config.backgroundColor = [new Color(widget_config.backgroundColor[0]), new Color(widget_config.backgroundColor[1])]
  } else {
    widget_config.backgroundColor = [
      Color.dynamic(
        new Color(widget_config.backgroundColorLight[0]),
        new Color(widget_config.backgroundColor[0])
      ),
      Color.dynamic(
        new Color(widget_config.backgroundColorLight[1]),
        new Color(widget_config.backgroundColor[1])
      )
    ]
  }
  // Highlight Text Color
  if (widget_config.textColorHighlightedLight == null) {
    widget_config.textColorHighlighted = new Color(widget_config.textColorHighlighted)
  } else {
    widget_config.textColorHighlighted = Color.dynamic(
        new Color(widget_config.textColorHighlightedLight),
        new Color(widget_config.textColorHighlighted)
      )
  }
  // Background Text Color
  if (widget_config.textColorBackgroundLight == null) {
    widget_config.textColorBackground = new Color(widget_config.textColorBackground)
  } else {
    widget_config.textColorBackground = Color.dynamic(
        new Color(widget_config.textColorBackgroundLight),
        new Color(widget_config.textColorBackground)
      )
  }
  // Text Shadow Color
  if (widget_config.textShadowHighlightedLight == null) {
    widget_config.textShadowHighlighted = new Color(widget_config.textShadowHighlighted)
  } else {
    widget_config.textShadowHighlighted = Color.dynamic(
        new Color(widget_config.textShadowHighlightedLight),
        new Color(widget_config.textShadowHighlighted)
      )
  }
}
async function setBackground() {
  if (widget_config.background_image) {
    const rx_url = /(((ftp|http|https):\/\/)|(\/)|(..\/))(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    if ((rx_url.exec(widget_config.background_image)) !== null) {
      // url found > getting image from url
      const image_url = widget_config.background_image;
      var rx_file_name = /\w*(\.)\w*$/gm;
      var image_name = "wordclock_" + rx_file_name.exec(image_url)[0];
      const files = FileManager.local();
      const path = files.joinPath(
        files.documentsDirectory(),
        image_name
      );
      console.log(path)
      const exists = files.fileExists(path);
      if (!exists || !config.runsInWidget) {
        const req = new Request(image_url)
        const img = await req[`loadImage`](image_url)
        widget.backgroundImage = img;
        files.writeImage(path, img);
      } else {
        widget.backgroundImage = files.readImage(path);
      }
    } else {
      // no url found > checking icloud
      // Determine if our image exists
      const files = FileManager.iCloud();
      const path = files.joinPath(
        files.documentsDirectory(),
        widget_config.background_image
      );
      const exists = files.fileExists(path);

      if (exists) {
        widget.backgroundImage = files.readImage(path);
      } else {
        throw new Error("file not found: " + widget_config.background_image)
      }
    }
  } else {
    // COLOR BACKGROUND
    var bgColor = new LinearGradient();
    bgColor.colors = widget_config.backgroundColor
    bgColor.locations = widget_config.backgroundGradientValue;
    widget.backgroundGradient = bgColor;
  }
}
const lineColor = widget_config.textColorHighlighted;//折线颜色
const dashlineColor = widget_config.textColorBackground;//虚线颜色
const titleColor = widget_config.textColorHighlighted;//大标题
const totalamountColor = widget_config.textColorHighlighted;//小标题
const smallText = new Font("HelveticaNeue", 14);//小字号
const largeText = new Font("HelveticaNeue-Bold", 20);//大字号

//定义绘图类
class LineChart {
    constructor(width, height, values, globalMaxValue, globalMinValue, smoothPath = 0, lineDash = null) {
        this.ctx = new DrawContext();
        this.ctx.size = new Size(width, height);
        this.values = values;
        this.smoothPath = smoothPath;
        this.lineDash = lineDash;
        this.globalMaxValue = globalMaxValue;
        this.globalMinValue = globalMinValue;
    }

    _calculatePath() {
        let difference = this.globalMaxValue - this.globalMinValue;
        let count = this.values.length;
        let step = this.ctx.size.width / (count - 1);

        let points = this.values.map((current, index, all) => {
            let x = step * index;
            let y = this.ctx.size.height - (current - this.globalMinValue) / difference * this.ctx.size.height;
            return new Point(x, y);
        });

        switch (this.smoothPath) {
            case 0: // 实线折线图
                return this._getPath(points, false);

            case 1: // 虚线折线图
                return this._getPath(points, true);

            case 2: // 平滑曲线图
                return this._getSmoothPath(points);

            case 3: // 直方图
                return this._drawBarChart();

            default: // 默认为实线折线图
                return this._getPath(points, false);
        }
    }

    _getSmoothPath(points) {
        let path = new Path();
        path.move(new Point(0, this.ctx.size.height));
        path.addLine(points[0]);
        for (let i = 0; i < points.length - 1; i++) {
            let xAvg = (points[i].x + points[i + 1].x) / 2;
            let yAvg = (points[i].y + points[i + 1].y) / 2;
            let avg = new Point(xAvg, yAvg);
            let cp1 = new Point((xAvg + points[i].x) / 2, points[i].y);
            let next = new Point(points[i + 1].x, points[i + 1].y);
            let cp2 = new Point((xAvg + points[i + 1].x) / 2, points[i + 1].y);
            path.addQuadCurve(avg, cp1);
            path.addQuadCurve(next, cp2);
        }
        path.addLine(new Point(this.ctx.size.width, this.ctx.size.height));
        path.closeSubpath();
        return path;
    }

    _getPath(points, isDashed) {
        let path = new Path();
        path.move(points[0]);
        for (var i = 1; i < points.length; i++) {
            if (isDashed && this.lineDash) {
                this._drawDashedLine(path, points[i - 1], points[i]);
            } else {
                path.addLine(points[i]);
            }
        }
        return path;
    }

    _drawDashedLine(path, fromPoint, toPoint) {
        const pattern = this.lineDash;
        let dx = toPoint.x - fromPoint.x;
        let dy = toPoint.y - fromPoint.y;
        let angle = Math.atan2(dy, dx);
        let distance = Math.sqrt(dx * dx + dy * dy);
        let patternLength = pattern.reduce((a, b) => a + b, 0);
        let currentDistance = 0;
        let patternIndex = 0;
        let draw = true;

        while (currentDistance < distance) {
            let segmentLength = pattern[patternIndex % pattern.length];

            if ((currentDistance + segmentLength) > distance) {
                segmentLength = distance - currentDistance;
            }

            let segmentEndX = fromPoint.x + Math.cos(angle) * segmentLength;
            let segmentEndY = fromPoint.y + Math.sin(angle) * segmentLength;

            if (draw) {
                path.addLine(new Point(segmentEndX, segmentEndY));
            } else {
                path.move(new Point(segmentEndX, segmentEndY));
            }

            draw = !draw;
            currentDistance += segmentLength;
            fromPoint = new Point(segmentEndX, segmentEndY);

            if (currentDistance < distance) {
                patternIndex++;
            } else if (!draw) {
                patternIndex = 0;
                currentDistance = 0;
            }
        }
    }

    _drawBarChart() {
        let difference = this.globalMaxValue - this.globalMinValue;
        let count = this.values.length;
        let step = this.ctx.size.width / count;
        let barWidth = step * 0.5; // 设置条形图的宽度

        let path = new Path();
        this.values.forEach((current, index) => {
            let x = step * index + (step - barWidth) / 2;
            let y = this.ctx.size.height - (current - this.globalMinValue) / difference * this.ctx.size.height;
            let rect = new Rect(x, y, barWidth, this.ctx.size.height - y);
            path.addRect(rect);
        });

        return path;
    }

    configure(fn) {
        let path = this._calculatePath();
        if (fn) {
            fn(this.ctx, path);
        } else {
            this.ctx.addPath(path);
            this.ctx.strokePath();
        }
        return this.ctx;
    }
}


//开始绘图
let lineChartData = lineChartValues;
let dashedLineChartData = dashedLineChartValues;
let barChartData = barChartValues;
let allValues = lineChartData.concat(dashedLineChartData, barChartData);
let globalMaxValue = Math.max(...allValues);
let globalMinValue = Math.min(...allValues);
const combinedWidth = 600;
const combinedHeight = 150;
const combinedCtx = new DrawContext();
combinedCtx.size = new Size(combinedWidth, combinedHeight);
combinedCtx.opaque = false;
combinedCtx.respectScreenScale = true;
const lineChart = new LineChart(combinedWidth, combinedHeight, lineChartData,globalMaxValue, globalMinValue, 0);
const dashedLineChart = new LineChart(combinedWidth, combinedHeight, dashedLineChartData,globalMaxValue, globalMinValue, 1, [4, 1]);//虚线的间距
const barChart = new LineChart(combinedWidth, combinedHeight, barChartData,globalMaxValue, globalMinValue, 3);

let linePath = lineChart._calculatePath();
combinedCtx.setStrokeColor(lineColor);//折线的颜色
combinedCtx.setLineWidth(8);//折线的粗细
combinedCtx.addPath(linePath);
combinedCtx.strokePath();

let dashPath = dashedLineChart._calculatePath();
combinedCtx.setStrokeColor(dashlineColor);//虚线的颜色
combinedCtx.setLineWidth(2);//虚线的粗细
combinedCtx.addPath(dashPath);
combinedCtx.strokePath();

let barPath = barChart._calculatePath();
combinedCtx.setFillColor(lineColor);//条形图的颜色
combinedCtx.addPath(barPath);//注释掉就没有条形图
combinedCtx.fillPath();

// 添加文字
const today = new Date();
const rTitle = `${formatTime(today)}`
const textPosition = new Point(0, 0); // 文字的起始位置（左上角）
combinedCtx.setFont(Font.boldSystemFont(12)); // 设置字体和大小
combinedCtx.setTextColor(lineColor); // 设置文字颜色
combinedCtx.drawText(rTitle, textPosition);

function formatTime(date) { // 定义一个函数，用于格式化将在小组件上显示的时间
  let df = new DateFormatter()
  df.useNoDateStyle()
  df.useShortTimeStyle()
  return df.string(date)
}


const combinedImage = combinedCtx.getImage();
//结束绘图





//开始绘制 widget
let widget = new ListWidget();
await setBackground();
var refreshDate = Date.now() + 1000*60*1 // 每 1 分钟刷新一次
widget.refreshAfterDate = new Date(refreshDate)


//排版-大标题
const year = today.getFullYear();
const month = today.getMonth(); // 注意：月份从0开始
const monthChinese = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const title = widget.addText(monthChinese[month]); // 设置标题
title.font = largeText;//设置标题字号
title.textColor = titleColor; //颜色

//排版-设置间隔
widget.addSpacer(4);

//排版-小标题
const maxValue = Math.max(...lineChartData);
const subTitleStr = `本月 ¥${maxValue} 今日 ¥${todayChartValues}`;
const subTitle = widget.addText(subTitleStr);
subTitle.textColor = totalamountColor;
subTitle.font = smallText;

//排版-设置间隔
widget.addSpacer();

//排版-chart
const chartImg = widget.addImage(combinedImage)
//chartImg.centerAlignImage()

//设置 widget点击的 url
widget.url = `https://applink.feishu.cn/client/docs/open?url=${tableConfig.url}`;


//预览
if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    widget.presentMedium();
}

//结束绘制 widget
Script.complete();
