<template>
    <div>
        <ForkMe />
        <h1>Image colors extractor | Javascript</h1>
        <h2>Extract all colors contained in an image in a .txt file</h2>
        <p>Made with Vue.js</p>
        <p>
            <strong>
                On large file the process can be really long (about 10min for a 1900x1258px)
            </strong>
        </p>

        <div class="percentage">
            <div class="percentage__bar" :style="{ width: percentage + '%' }"></div>
            <span class="percentage__value"> {{ percentage }}% </span>
        </div>

        <div class="input-box">
            <input type="file" name="file-7[]" id="file-7" @change="readUrl()" ref="inputRef" class="inputfile inputfile-6" />
            <label for="file-7">
                <span>{{ filename }}</span>
                <strong>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17">
                        <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z" />
                    </svg>
                    Choose a file&hellip;
                </strong>
            </label>
        </div>

        <div class="actions">
            <button v-if="!isStart" @click="start()">Export all colors</button>
            <button @click="download()" v-if="finish">download</button>
            <button v-if="isStart && !finish" @click="stop()">Stop</button>
        </div>

        <div class="count" v-if="colorSet.size > 0">
            This image contains {{ colorSet.size }} different colors
        </div>

        <div class="vibrant" v-if="vibrants">
            <h3>Dominant colors</h3>
            <div class="vibrants">
                <template v-for="(value, key) in vibrants" :key="key">
                    <div class="vibrants__item" v-if="value">
                        <div class="vibrants__color" :style="{ backgroundColor: value.hex }"></div>
                        <div>{{ key }}</div>
                        <div>{{ value.hex }}</div>
                    </div>
                </template>
            </div>
        </div>

        <div class="image--preview">
            <img v-if="imgData" :src="imgData" alt="your image" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUpdated } from 'vue'
import { saveAs } from 'file-saver'
import { Vibrant } from 'node-vibrant/browser'
import type { Palette } from 'node-vibrant/types'
import ForkMe from './ForkMe.vue'

const imgData = ref<string | null>(null)
const canvas = ref<CanvasRenderingContext2D | null>(null)
const width = ref(0)
const height = ref(0)
const colorSet = ref(new Set<string>())
const lineToRead = ref(0)
const isStart = ref(false)
const csvContent = ref<string | null>(null)
const finish = ref(false)
const filename = ref('')
const vibrants = ref<Palette | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const percentage = computed(() => {
    if (height.value <= 1) return 0
    const percent = (lineToRead.value / (height.value - 1)) * 100
    return Math.round(percent * 10) / 10
})

onUpdated(() => {
    if (lineToRead.value < height.value && isStart.value) {
        setTimeout(() => {
            exportPixelData()
        }, 0)
    }
    if (lineToRead.value === height.value - 1 && isStart.value) {
        onFinish()
    }
})

function defaultData() {
    imgData.value = null
    canvas.value = null
    width.value = 0
    height.value = 0
    colorSet.value = new Set()
    lineToRead.value = 0
    isStart.value = false
    csvContent.value = null
    finish.value = false
    filename.value = ''
    vibrants.value = null
}

function exportPixelData() {
    if (lineToRead.value + 1 < height.value) {
        lineToRead.value++
        readLine(lineToRead.value)
    }
}

function readLine(y: number) {
    for (let x = 1; x < width.value; x++) {
        const data = readPixelOfCanvas(x, y)
        colorSet.value.add(data.hex)
    }
}

function start() {
    isStart.value = true
    exportPixelData()
}

function stop() {
    isStart.value = false
}

function onFinish() {
    csvContent.value = [...colorSet.value].join(',')
    finish.value = true
}

function download() {
    const blob = new Blob([csvContent.value!], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'imageData.txt')
}

function imgToCanvas() {
    const canvasEl = document.createElement('canvas')
    const pic = new Image()
    pic.src = imgData.value!
    pic.onload = () => {
        canvasEl.width = pic.width
        canvasEl.height = pic.height
        width.value = pic.width
        height.value = pic.height
        const ctx = canvasEl.getContext('2d')!
        ctx.drawImage(pic, 0, 0)
        canvas.value = ctx
    }
}

function readPixelOfCanvas(x: number, y: number) {
    const pixelData = canvas.value!.getImageData(x, y, 1, 1).data
    return {
        hex: rgbToHex(pixelData[0], pixelData[1], pixelData[2]),
    }
}

function setFilename(input: HTMLInputElement) {
    const fullPath = input.value
    const startIndex =
        fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/')
    let fname = fullPath.substring(startIndex)
    if (fname.indexOf('\\') === 0 || fname.indexOf('/') === 0) {
        fname = fname.substring(1)
    }
    filename.value = fname
}

function readUrl() {
    defaultData()
    const input = inputRef.value!
    setFilename(input)
    if (input.files && input.files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => {
            imgData.value = (e.target as FileReader).result as string
            imgToCanvas()
            defineVibrant()
        }
        reader.readAsDataURL(input.files[0])
    }
}

function rgbToHex(r: number, g: number, b: number) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

async function defineVibrant() {
    const palette = await Vibrant.from(imgData.value!).getPalette()
    vibrants.value = palette
}
</script>

<style lang="scss">
body {
    background: #4cb5ae;
    text-align: center;
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

    +button {
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

.inputfile+label {
    max-width: 80%;
    font-size: 1.25rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    display: inline-block;
    overflow: hidden;
    padding: 0.625rem 1.25rem;
}

.no-js .inputfile+label {
    display: none;
}

.inputfile:focus+label,
.inputfile.has-focus+label {
    outline: 1px dotted #000;
    outline: -webkit-focus-ring-color auto 5px;
}

.inputfile+label svg {
    width: 1em;
    height: 1em;
    vertical-align: middle;
    fill: currentColor;
    margin-top: -0.25em;
    margin-right: 0.25em;
}

.inputfile-6+label {
    color: #2c3e50;
    border: 1px solid #2c3e50;
    background-color: #d6dee4;
    padding: 0;
}

.inputfile-6:focus+label,
.inputfile-6.has-focus+label,
.inputfile-6+label:hover {
    border-color: #000;
}

.inputfile-6+label span,
.inputfile-6+label strong {
    padding: 0.625rem 1.25rem;
}

.inputfile-6+label span {
    width: 200px;
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    vertical-align: top;
}

.inputfile-6+label strong {
    height: 100%;
    color: #f1e5e6;
    background-color: #2c3e50;
    display: inline-block;
}

.inputfile-6:focus+label strong,
.inputfile-6.has-focus+label strong,
.inputfile-6+label:hover strong {
    background-color: #1a252f;
}

@media screen and (max-width: 50em) {
    .inputfile-6+label strong {
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
