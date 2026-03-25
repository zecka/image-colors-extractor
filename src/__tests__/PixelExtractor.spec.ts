import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PixelExtractor from '../components/PixelExtractor.vue'

// Mock file-saver
vi.mock('file-saver', () => ({ saveAs: vi.fn() }))

// Mock node-vibrant
vi.mock('node-vibrant/browser', () => ({
  Vibrant: {
    from: vi.fn().mockReturnValue({
      getPalette: vi.fn().mockResolvedValue({
        Vibrant: { hex: '#aabbcc' },
        Muted: { hex: '#112233' },
      }),
    }),
  },
}))

// Mock ForkMe to avoid its own dependencies in tests
vi.mock('../components/ForkMe.vue', () => ({
  default: { template: '<div />' },
}))

describe('PixelExtractor', () => {
  describe('initial render', () => {
    it('renders the title', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.find('h1').text()).toContain('Image colors extractor')
    })

    it('shows the "Export all colors" button by default', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.text()).toContain('Export all colors')
    })

    it('does not show the download button initially', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.text()).not.toContain('download')
    })

    it('does not show the Stop button initially', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.text()).not.toContain('Stop')
    })

    it('shows 0% progress initially', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.find('.percentage__value').text()).toContain('0%')
    })

    it('does not show the color count block initially', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.find('.count').exists()).toBe(false)
    })

    it('does not show the image preview initially', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.find('.image--preview img').exists()).toBe(false)
    })

    it('does not show dominant colors section initially', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.find('.vibrant').exists()).toBe(false)
    })
  })

  describe('start / stop', () => {
    it('hides "Export all colors" and shows "Stop" after clicking start', async () => {
      const wrapper = mount(PixelExtractor)
      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).not.toContain('Export all colors')
      expect(wrapper.text()).toContain('Stop')
    })

    it('shows "Export all colors" again after stopping', async () => {
      const wrapper = mount(PixelExtractor)
      await wrapper.find('button').trigger('click') // start
      const stopBtn = wrapper.findAll('button').find((b) => b.text() === 'Stop')
      await stopBtn!.trigger('click')
      expect(wrapper.text()).toContain('Export all colors')
      expect(wrapper.text()).not.toContain('Stop')
    })
  })

  describe('file input label', () => {
    it('shows empty filename label by default', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.find('label span').text()).toBe('')
    })

    it('has a file input', () => {
      const wrapper = mount(PixelExtractor)
      const input = wrapper.find('input[type="file"]')
      expect(input.exists()).toBe(true)
    })
  })

  describe('percentage bar', () => {
    it('renders the percentage bar element', () => {
      const wrapper = mount(PixelExtractor)
      expect(wrapper.find('.percentage__bar').exists()).toBe(true)
    })

    it('sets the percentage bar width to 0% initially', () => {
      const wrapper = mount(PixelExtractor)
      const bar = wrapper.find('.percentage__bar')
      expect(bar.attributes('style')).toContain('width: 0%')
    })
  })

  describe('readUrl — file processing', () => {
    function makeFile(name: string): File {
      return new File([''], name, { type: 'image/png' })
    }

    it('updates the filename label after selecting a file', async () => {
      const wrapper = mount(PixelExtractor)
      const input = wrapper.find('input[type="file"]')

      const file = makeFile('photo.png')
      Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
      Object.defineProperty(input.element, 'value', {
        value: '/path/to/photo.png',
        configurable: true,
      })

      class FileReaderMock {
        onload: ((e: ProgressEvent) => void) | null = null
        readAsDataURL = vi.fn()
      }
      vi.stubGlobal('FileReader', FileReaderMock)

      await input.trigger('change')

      expect(wrapper.find('label span').text()).toBe('photo.png')

      vi.unstubAllGlobals()
    })

    it('resets state when a new file is selected', async () => {
      const wrapper = mount(PixelExtractor)
      const input = wrapper.find('input[type="file"]')

      // Trigger start first to dirty the state
      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).toContain('Stop')

      Object.defineProperty(input.element, 'files', { value: [], configurable: true })
      Object.defineProperty(input.element, 'value', { value: '', configurable: true })

      class FileReaderMock {
        onload: ((e: ProgressEvent) => void) | null = null
        readAsDataURL = vi.fn()
      }
      vi.stubGlobal('FileReader', FileReaderMock)

      await input.trigger('change')

      // State should be reset: Export all colors visible again
      expect(wrapper.text()).toContain('Export all colors')

      vi.unstubAllGlobals()
    })
  })
})
