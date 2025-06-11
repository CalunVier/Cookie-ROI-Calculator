// Cookie ROI Calculator Mod
// 合并版本 - 包含所有必要的组件

// 配置常量
const MOD_ID = 'cookie_roi_calculator';

// 本地化数据
const localeData = {
    'zh-CN': {
        ModLoaded: 'ROI计算器已加载',
        Calculating: '正在运行性价比计算...',
        ROI: '投资回报率',
        NormalizedROI: '归一化百分比',
        Rank: '排名',
        PaybackTime: '回本时间',
        PerSecond: '/秒',
        PerMinute: '/分钟',
        PerHour: '/小时',
        PerDay: '/天',
        PerMonth: '/月',
        PerYear: '/年'
    },
    'en': {
        ModLoaded: 'ROI Calculator Loaded',
        Calculating: 'Calculating ROI...',
        ROI: 'ROI',
        NormalizedROI: 'Normalized',
        Rank: 'Rank',
        PaybackTime: 'Payback Time',
        PerSecond: '/sec',
        PerMinute: '/min',
        PerHour: '/hour',
        PerDay: '/day',
        PerMonth: '/month',
        PerYear: '/year'
    }
};

// 本地化函数
function loc(key) {
    console.log(`[Cookie ROI] Localizing key: ${key}`);
    
    // 获取当前语言设置，默认为英文
    let currentLang = Game.language || 'en';
    
    // 如果是中文相关的语言代码，使用中文
    if (currentLang.startsWith('zh')) {
        currentLang = 'zh-CN';
    } else {
        currentLang = 'en';
    }
    
    console.log(`[Cookie ROI] Current language: ${currentLang}`);
    
    // 解析key，格式如 [cookie_roi_calculator]ModLoaded
    let cleanKey = key.replace(`[${MOD_ID}]`, '');
    console.log(`[Cookie ROI] Clean key: ${cleanKey}`);
    
    if (localeData[currentLang] && localeData[currentLang][cleanKey]) {
        let result = localeData[currentLang][cleanKey];
        console.log(`[Cookie ROI] Found translation: ${result}`);
        return result;
    }
    
    // 如果当前语言没有找到，回退到英文
    if (localeData['en'] && localeData['en'][cleanKey]) {
        let result = localeData['en'][cleanKey];
        console.log(`[Cookie ROI] Using fallback translation: ${result}`);
        return result;
    }
    
    // 如果都没找到，返回原始key
    console.log(`[Cookie ROI] No translation found, returning: ${cleanKey}`);
    return cleanKey;
}

// 注册模组
Game.registerMod(MOD_ID, {
    init: function () {
        console.log('[Cookie ROI] Mod initialization started');
        
        // 添加初始化提示
        try {
            Game.Notify(
                loc(`[${MOD_ID}]ModLoaded`),
                loc(`[${MOD_ID}]Calculating`),
                [16, 5]
            );
            console.log('[Cookie ROI] Notification sent successfully');
        } catch (error) {
            console.error('[Cookie ROI] Error sending notification:', error);
        }

        // 存储建筑ROI的数组
        this.ROIMap = new Map();

        // 计算建筑的ROI（投资回报率）
        this.calculateBuildingROI = function (building) {
            console.log(`[Cookie ROI] Calculating ROI for building: ${building.name}, amount: ${building.amount}`);
            
            if (building.amount <= 0) {
                console.log(`[Cookie ROI] Building ${building.name} has no units, returning 0`);
                return 0;
            }

            let baseCps = building.storedCps;
            let mult = Game.globalCpsMult;
            
            console.log(`[Cookie ROI] Base CPS: ${baseCps}, Global mult: ${mult}`);

            for (let i in Game.buffs) {
                if (Game.buffs[i].multCpS) {
                    mult *= Game.buffs[i].multCpS;
                    console.log(`[Cookie ROI] Applied buff ${i}, new mult: ${mult}`);
                }
            }

            let currentCps = baseCps * building.amount * mult;
            let futureCps = baseCps * (building.amount + 1) * mult;
            let deltaCps = futureCps - currentCps;
            let roi = deltaCps / building.price;
            
            console.log(`[Cookie ROI] ${building.name} - Current CPS: ${currentCps}, Future CPS: ${futureCps}, Delta: ${deltaCps}, Price: ${building.price}, ROI: ${roi}`);

            return roi;
        };

        // 计算回本时间（秒）
        this.calculatePaybackTime = function (roi) {
            if (roi <= 0) return Infinity;
            return 1 / roi;
        };

        // 计算归一化的ROI值和排名
        this.calculateNormalizedROI = function () {
            console.log('[Cookie ROI] Starting normalized ROI calculation');
            let roiValues = [];

            for (let i in Game.Objects) {
                let building = Game.Objects[i];
                let roi = this.calculateBuildingROI(building);
                roiValues.push({
                    name: building.name,
                    roi: roi
                });
            }
            
            console.log(`[Cookie ROI] Calculated ROI for ${roiValues.length} buildings`);
            roiValues.sort((a, b) => b.roi - a.roi);
            const maxROI = roiValues[0].roi;
            console.log(`[Cookie ROI] Max ROI: ${maxROI} from ${roiValues[0].name}`);

            this.ROIMap.clear();
            roiValues.forEach((item, index) => {
                this.ROIMap.set(item.name, {
                    normalizedROI: maxROI > 0 ? (item.roi / maxROI * 100) : 0,
                    rank: index + 1
                });
            });
            
            console.log(`[Cookie ROI] Updated ROI map with ${this.ROIMap.size} entries`);
        };

        // 格式化ROI信息
        this.formatROIInfo = function (building) {
            console.log(`[Cookie ROI] Formatting ROI info for ${building.name}`);
            let roi = this.calculateBuildingROI(building);
            let paybackTime = this.calculatePaybackTime(roi);
            let roiInfo = this.ROIMap.get(building.name);
            
            console.log(`[Cookie ROI] ${building.name} - ROI: ${roi}, Payback: ${paybackTime}, Info:`, roiInfo);

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
            
            console.log(`[Cookie ROI] ${building.name} - Selected time unit: ${timeUnit}, ROI value: ${roiValue}`);
            
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

            console.log(`[Cookie ROI] Generated text for ${building.name}:`, text);
            return text;
        };

        // 使用hook修改建筑的tooltip
        let self = this;
        console.log('[Cookie ROI] Registering draw hook');
        
        Game.registerHook('draw', function () {
            try {
                console.log('[Cookie ROI] Draw hook triggered');
                self.calculateNormalizedROI();

                let buildingCount = 0;
                for (let i in Game.Objects) {
                    let building = Game.Objects[i];
                    let originalDesc = building.desc.split('<br>--------------<br>')[0];
                    let newDesc = originalDesc + self.formatROIInfo.call(self, building);
                    building.desc = newDesc;
                    buildingCount++;
                }
                console.log(`[Cookie ROI] Updated descriptions for ${buildingCount} buildings`);
            } catch (error) {
                console.error('[Cookie ROI] Error in draw hook:', error);
            }
        });
        
        console.log('[Cookie ROI] Mod initialization completed');
    },

    save: function () {
        return "{}";
    },

    load: function (str) { }
});
