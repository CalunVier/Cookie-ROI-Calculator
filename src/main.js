import { MOD_ID } from './config';

Game.registerMod(MOD_ID, {
    init: function () {
        // 添加初始化提示
        Game.Notify(
            loc(`[${MOD_ID}]ModLoaded`),
            loc(`[${MOD_ID}]Calculating`),
            [16, 5]
        );

        // 存储建筑ROI的数组
        this.ROIMap = new Map();

        // 计算建筑的ROI（投资回报率）
        this.calculateBuildingROI = function (building) {
            if (building.amount <= 0) return 0;

            let baseCps = building.storedCps;
            let mult = Game.globalCpsMult;

            for (let i in Game.buffs) {
                if (Game.buffs[i].multCpS) {
                    mult *= Game.buffs[i].multCpS;
                }
            }

            let currentCps = baseCps * building.amount * mult;
            let futureCps = baseCps * (building.amount + 1) * mult;
            let deltaCps = futureCps - currentCps;
            let roi = deltaCps / building.price;

            return roi;
        };

        // 计算回本时间（秒）
        this.calculatePaybackTime = function (roi) {
            if (roi <= 0) return Infinity;
            return 1 / roi;
        };

        // 计算归一化的ROI值和排名
        this.calculateNormalizedROI = function () {
            let roiValues = [];

            for (let i in Game.Objects) {
                let building = Game.Objects[i];
                let roi = this.calculateBuildingROI(building);
                roiValues.push({
                    name: building.name,
                    roi: roi
                });
            }

            roiValues.sort((a, b) => b.roi - a.roi);
            const maxROI = roiValues[0].roi;

            this.ROIMap.clear();
            roiValues.forEach((item, index) => {
                this.ROIMap.set(item.name, {
                    normalizedROI: maxROI > 0 ? (item.roi / maxROI * 100) : 0,
                    rank: index + 1
                });
            });
        };

        // 格式化ROI信息
        this.formatROIInfo = function (building) {
            let roi = this.calculateBuildingROI(building);
            let paybackTime = this.calculatePaybackTime(roi);
            let roiInfo = this.ROIMap.get(building.name);

            let text = '<br>--------------<br>';
            
            let timeUnits = [
                {name: 'Second', multiplier: 1},
                {name: 'Minute', multiplier: 60},
                {name: 'Hour', multiplier: 60 * 60},
                {name: 'Day', multiplier: 60 * 60 * 24},
                {name: 'Month', multiplier: 60 * 60 * 24 * 30},
                {name: 'Year', multiplier: 60 * 60 * 24 * 365}
            ];
            
            let roiValue = roi * 100;
            let timeUnit = 'Second';
            let timeMultiplier = 1;
            let num = 1; // 阈值
            
            // 自动选择合适的时间单位
            for(let i = 0; i < timeUnits.length; i++) {
                if(roiValue > 0 && roiValue < num && i < timeUnits.length - 1) {
                    timeUnit = timeUnits[i+1].name;
                    timeMultiplier = timeUnits[i+1].multiplier;
                    roiValue = roi * 100 * timeMultiplier;
                } else {
                    break;
                }
            }
            
            text += loc(`[${MOD_ID}]ROI`) + ': ' +
                (roi > 0 ? Beautify(roiValue, 3) : '0') +
                '%' + loc(`[${MOD_ID}]Per${timeUnit}`);

            if (roiInfo) {
                text += '<br>' + loc(`[${MOD_ID}]NormalizedROI`) + ': ' +
                    Beautify(roiInfo.normalizedROI, 1) + '%';
                text += '<br>' + loc(`[${MOD_ID}]Rank`) + ': #' +
                    roiInfo.rank;
            }

            if (paybackTime !== Infinity && paybackTime > 0) {
                text += '<br>' + loc(`[${MOD_ID}]PaybackTime`) + ': ' +
                    Game.sayTime(paybackTime * Game.fps);
            }

            return text;
        };

        // 使用hook修改建筑的tooltip
        let self = this;
        Game.registerHook('draw', function () {
            self.calculateNormalizedROI();

            for (let i in Game.Objects) {
                let building = Game.Objects[i];
                let originalDesc = building.desc.split('<br>--------------<br>')[0];
                building.desc = originalDesc + self.formatROIInfo.call(self, building);
            }
        });
    },

    save: function () {
        return "{}";
    },

    load: function (str) { }
});