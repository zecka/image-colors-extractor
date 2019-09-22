<template>
  <div>
    <ForkMe />
    <h1>Image colors extractor | Javascript</h1>
    <h2>Extract all colors contained in an image in a .txt file</h2>
    <p>
      Made with Vue.js
    </p>
    <p>
      <strong
        >On large file the process can be really long (about 10min for a
        1900x1258px )</strong
      >
    </p>
    <div class="percentage">
      <div class="percentage__bar" :style="'width:' + percentage() + '%'"></div>
      <span class="percentage__value"> {{ percentage() }}% </span>
    </div>

    <div class="input-box">
      <input
        type="file"
        name="file-7[]"
        id="file-7"
        @change="readUrl()"
        ref="input"
        class="inputfile inputfile-6"
      />
      <label for="file-7"
        ><span>{{ filename }}</span>
        <strong
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="17"
            viewBox="0 0 20 17"
          >
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg>
          Choose a file&hellip;</strong
        ></label
      >
    </div>
    <div class="actions">
      <button v-if="!isStart" @click="start()">Export all colors</button>
      <button @click="download()" v-if="finish">download</button>
      <button v-if="isStart && !finish" @click="stop()">
        Stop
      </button>
    </div>
    <div class="count" v-if="colorSet.size > 0">
      This image countain {{ colorSet.size }} differents colors
    </div>
    <div class="vibrant" v-if="vibrants">
      <h3>Dominent colors</h3>
      <div class="vibrants">
        <div
          class="vibrants__item"
          v-for="(value, key) in vibrants"
          v-if="value"
        >
          <div
            class="vibrants__color"
            :style="'background-color:' + value.hex + ''"
          ></div>
          <div>{{ key }}</div>
          <div>{{ value.hex }}</div>
        </div>
      </div>
    </div>
    <div class="image--preview">
      <img v-if="imgData" :src="imgData" ref="imagePreview" alt="your image" />
    </div>
  </div>
</template>

<script>
function initialState() {
  return {
    imgData: false,
    canvas: false,
    width: 0,
    height: 0,
    colorSet: new Set(),
    lineToRead: 0,
    test: 0,
    isStart: false,
    csvContent: false,
    finish: false,
    filename: "",
    vibrants: false
  };
}
import FileSaver from "file-saver";
import Vibrant from "node-vibrant";
import ForkMe from "./ForkMe.vue";

export default {
  name: "PixelExtractor",
  components: { ForkMe },
  data: function() {
    return initialState();
  },
  updated() {
    if (this.lineToRead < this.height && this.isStart) {
      setTimeout(() => {
        this.exportPixelData();
      }, 0);
    }

    if (this.lineToRead === this.height - 1 && this.isStart) {
      this.onFinish();
    }
  },
  methods: {
    defaultData() {
      Object.assign(this.$data, initialState());
    },
    exportPixelData() {
      if (this.lineToRead + 1 < this.height) {
        this.lineToRead++;
        this.readLine(this.lineToRead);
      }
    },
    readLine(y) {
      for (let x = 1; x < this.width; x++) {
        const data = this.readPixelOfCanvas(x, y);
        this.colorSet.add(data.hex);
      }
    },
    percentage() {
      const percent = (this.lineToRead / (this.height - 1)) * 100;
      return Math.round(percent * 10) / 10;
    },
    start() {
      this.isStart = true;
      this.exportPixelData();
    },
    stop() {
      this.isStart = false;
    },
    onFinish() {
      this.csvContent = [...this.colorSet].join(",");
      this.finish = true;
    },
    download() {
      var blob = new Blob([this.csvContent], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "imageData.txt");
    },
    imgToCanvas() {
      const canvas = document.createElement("canvas");
      const pic = new Image();
      pic.src = this.imgData;
      pic.onload = () => {
        canvas.width = pic.width;
        canvas.height = pic.height;
        this.width = pic.width;
        this.height = pic.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(pic, 0, 0);
      };
      const imageReadable = canvas.getContext("2d");
      this.canvas = imageReadable;
    },
    readPixelOfCanvas(x, y) {
      const pixelData = this.canvas.getImageData(x, y, 1, 1).data;
      return {
        rgb: {
          r: pixelData[0],
          g: pixelData[1],
          b: pixelData[2]
        },
        hex: this.rgbToHex(pixelData[0], pixelData[1], pixelData[2])
      };
    },
    setFilename(input) {
      let fullPath = input.value;
      var startIndex =
        fullPath.indexOf("\\") >= 0
          ? fullPath.lastIndexOf("\\")
          : fullPath.lastIndexOf("/");
      var filename = fullPath.substring(startIndex);
      if (filename.indexOf("\\") === 0 || filename.indexOf("/") === 0) {
        filename = filename.substring(1);
      }
      this.filename = filename;
    },
    readUrl() {
      this.defaultData();
      const input = this.$refs.input;
      this.setFilename(input);
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = e => {
          this.imgData = e.target.result;
          this.imgToCanvas();
          this.defineVibrant();
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    rgbToHex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    defineVibrant() {
      var img = document.createElement("img");
      img.setAttribute("src", this.imgData);
      Vibrant.from(img).getPalette((err, palette) => (this.vibrants = palette));
    }
  }
};
</script>
<style lang="scss">
body {
  background: #4cb5ae;
}
h1 {
  max-width: 80%;
  margin: auto;
}
.image--preview {
  max-width: 800px;
  width: 80%;
  margin: auto;
  text-align: center;
  img {
    max-width: 100%;
    height: auto;
  }
}
.image--ref {
  position: absolute;
}
.percentage {
  border-radius: 5px;
  border: 1px solid #2c3e50;
  max-width: 500px;
  width: 80%;
  height: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  overflow: hidden;
  &__value {
    position: relative;
    z-index: 2;
    font-weight: bold;
    color: white;
  }
  &__bar {
    background: #2c3e50;
    position: absolute;
    left: 0;
    bottom: 0;
    top: 0;
  }
}
.actions {
  margin: 30px 0;
}
button {
  border: 1px solid #2c3e50;
  background: transparent;
  font-size: 1.5em;
  padding: 0.5em 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: #2c3e50;
    color: white;
  }
  + button {
    margin-left: 10px;
  }
}
.input-box {
  margin: 30px 0 0;
}
.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.inputfile + label {
  max-width: 80%;
  font-size: 1.25rem;
  /* 20px */
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  padding: 0.625rem 1.25rem;
  /* 10px 20px */
}

.no-js .inputfile + label {
  display: none;
}

.inputfile:focus + label,
.inputfile.has-focus + label {
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}

.inputfile + label * {
  /* pointer-events: none; */
  /* in case of FastClick lib use */
}

.inputfile + label svg {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  margin-top: -0.25em;
  /* 4px */
  margin-right: 0.25em;
  /* 4px */
}

.inputfile-6 + label {
  color: #2c3e50;
}

.inputfile-6 + label {
  border: 1px solid #2c3e50;
  background-color: lighten(#2c3e50, 60);
  padding: 0;
}

.inputfile-6:focus + label,
.inputfile-6.has-focus + label,
.inputfile-6 + label:hover {
  border-color: darken(#2c3e50, 40);
}

.inputfile-6 + label span,
.inputfile-6 + label strong {
  padding: 0.625rem 1.25rem;
  /* 10px 20px */
}

.inputfile-6 + label span {
  width: 200px;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  vertical-align: top;
}

.inputfile-6 + label strong {
  height: 100%;
  color: #f1e5e6;
  background-color: #2c3e50;
  display: inline-block;
}

.inputfile-6:focus + label strong,
.inputfile-6.has-focus + label strong,
.inputfile-6 + label:hover strong {
  background-color: darken(#2c3e50, 4);
}

@media screen and (max-width: 50em) {
  .inputfile-6 + label strong {
    display: block;
  }
}

.vibrants {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 30px 0;
  &__item {
    width: 100px;
  }
  &__color {
    padding-bottom: 50%;
  }
}
</style>