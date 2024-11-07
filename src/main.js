import { LocalizationConfig } from './localization';
import { calculateBuildingROI, calculatePaybackTime } from './utils';

Game.registerMod("cookie_roi_calculator", {
    init: function () {
        this.ROIArray = new Map();

        this.getCurrentLanguage = function () {
            const currentLang = Game.prefs.language;
            return LocalizationConfig.hasOwnProperty(currentLang) ? currentLang : 'en';
        };

        this.getText = function (key) {
            const lang = this.getCurrentLanguage();
            return LocalizationConfig[lang][key];
        };

        Game.Notify(
            this.getText('modLoaded'),
            this.getText('calculating'),
            [16, 5]
        );

        this.calculateNormalizedROI = function () {
            let roiValues = [];

            for (let i in Game.Objects) {
                let building = Game.Objects[i];
                let roi = calculateBuildingROI(building);
                roiValues.push({
                    name: building.name,
                    roi: roi
                });
            }

            roiValues.sort((a, b) => b.roi - a.roi);
            const maxROI = roiValues[0].roi;

            this.ROIArray.clear();
            roiValues.forEach((item, index) => {
                this.ROIArray.set(item.name, {
                    normalizedROI: maxROI > 0 ? (item.roi / maxROI * 100) : 0,
                    rank: index + 1
                });
            });
        };

        this.formatROIInfo = function (building) {
            let roi = calculateBuildingROI(building);
            let paybackTime = calculatePaybackTime(roi);
            let roiInfo = this.ROIArray.get(building.name);

            let text = '<br>-----------------<br>';
            text += this.getText('roi') + ': ' +
                (roi > 0 ? Beautify(roi * 100, 2) : '0') +
                '%' + this.getText('perSecond');

            if (roiInfo) {
                text += '<br>' + this.getText('normalizedRoi') + ': ' +
                    Beautify(roiInfo.normalizedROI, 1) + '%';
                text += '<br>' + this.getText('rank') + ': #' +
                    roiInfo.rank;
            }

            if (paybackTime !== Infinity && paybackTime > 0) {
                text += '<br>' + this.getText('paybackTime') + ': ' +
                    Game.sayTime(paybackTime * Game.fps);
            }

            return text;
        };

        let self = this;
        Game.registerHook('draw', function () {
            self.calculateNormalizedROI();

            for (let i in Game.Objects) {
                let building = Game.Objects[i];
                let originalDesc = building.desc.split('<br>-----------------<br>')[0];
                building.desc = originalDesc + self.formatROIInfo.call(self, building);
            }
        });
    },

    save: function () {
        return "{}";
    },

    load: function (str) {
        // 初始化会处理加载提示
    }
});