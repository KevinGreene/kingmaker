import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = {
        playerId: Number,
        mapId: Number
    }

    connect(){
        const sliderCols = document.getElementById('map-col-control');
        const valueDisplayCols = document.getElementById('map-col-value');
        const sliderRows = document.getElementById('map-row-control');
        const valueDisplayRows = document.getElementById('map-row-value');
        const radiusSize = document.getElementById("map-hex-radius-control");
        const radiusDisplay = document.getElementById("map-hex-radius-value");

        /**
         * Column Controls
         */
        if(sliderCols) {
            sliderCols.addEventListener('input', function () {
                valueDisplayCols.textContent = this.value;
                const event = new CustomEvent('dimensionChange', {
                    detail: {
                        cols: sliderCols.value,
                        rows: sliderRows.value
                    },
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            });
        }

        /**
         * Row Controls
         */
        if(sliderRows) {
            sliderRows.addEventListener('input', function () {
                valueDisplayRows.textContent = this.value;
                const event = new CustomEvent('dimensionChange', {
                    detail: {
                        cols: sliderCols.value,
                        rows: sliderRows.value
                    },
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            });
        }

        /**
         * Radius Controls
         */
        if(radiusSize) {
            radiusSize.addEventListener('input', function () {
                radiusDisplay.textContent = this.value;
                const event = new CustomEvent('radiusChange', {
                    detail: {
                        radius: (radiusSize.value)
                    },
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            })
        }
    }

    saveAll(){
        this.dispatch("saveAll", {
            detail:{
                playerId: this.playerIdValue,
                mapId: this.mapIdValue
            },
            bubbles: true
        });
    }

    updateHexTransform() {
        this.offsetXValue = parseFloat(document.getElementById("position_x").value);
        this.offsetYValue = parseFloat(document.getElementById("position_y").value);
        this.scaleXValue = parseFloat(document.getElementById("scale_x").value);
        this.scaleYValue = parseFloat(document.getElementById("scale_y").value);

        this.dispatch("svgTransformChange", {
            detail:{
                offsetXValue: this.offsetXValue,
                offsetYValue: this.offsetYValue,
                scaleXValue: this.scaleXValue,
                scaleYValue: this.scaleYValue
            },
            bubbles: true
        })
    }

    flipHexStyle() {
        const flipHexButton = document.getElementById("hex-style-switch");
        if (flipHexButton.textContent.charAt(0) === "⬢") {
            flipHexButton.textContent = "⬣";
            this.hexStyle = "⬣";
        } else {
            flipHexButton.textContent = "⬢";
            this.hexStyle = "⬢";
        }
        this.dispatch("hexStyleChange", {
            detail:{
                hexStyle: this.hexStyle
            },
            bubbles: true
        });
    }

    decrementCols(){
        const colControl = document.getElementById('map-col-control');
        const cols = parseInt(colControl.value);
        if(cols > colControl.min){
            colControl.value = cols - 1;
            this.updateMapColValue(colControl.value);
        }
    }
    incrementCols(){
        const colControl = document.getElementById('map-col-control');
        const cols = parseInt(colControl.value);
        if(cols < colControl.max){
            colControl.value = cols + 1;
            this.updateMapColValue(colControl.value);
        }
    }
    decrementRows(){
        const rowControl = document.getElementById('map-row-control');
        const rows = parseInt(rowControl.value);
        if(rows > rowControl.min){
            rowControl.value = rows - 1;
            this.updateMapRowValue(rowControl.value);
        }
    }
    incrementRows(){
        const rowControl = document.getElementById('map-row-control');
        const rows = parseInt(rowControl.value);
        if(rows < rowControl.max){
            rowControl.value = rows + 1;
            this.updateMapRowValue(rowControl.value);
        }
    }
    decrementHexRadius(){
        const radiusControl = document.getElementById("map-hex-radius-control");
        const radius = parseInt(radiusControl.value);
        if(radius > radiusControl.min){
            radiusControl.value = radius - 1;
            this.updateHexRadius(radiusControl.value);
        }
    }
    incrementHexRadius(){
        const radiusControl = document.getElementById("map-hex-radius-control");
        const radius = parseInt(radiusControl.value);
        if(radius < radiusControl.max){
            radiusControl.value = radius + 1;
            this.updateHexRadius(radiusControl.value);
        }
    }

    updateHexRadius(value){
        document.getElementById("map-hex-radius-value").textContent = value;
        this.dispatch("radiusChange", {
            detail:{
                radius: parseInt(value)
            },
            bubbles: true
        });
    }

    updateMapColValue(value) {
        document.getElementById('map-col-value').textContent = value;
        this.dispatch("colChange", {
            detail:{
                cols: parseInt(value)
            },
            bubbles: true
        });
    }

    updateMapRowValue(value) {
      document.getElementById('map-row-value').textContent = value;
      this.dispatch("rowChange", {
            detail:{
                rows: parseInt(value)
            },
            bubbles: true
        });
    }
}