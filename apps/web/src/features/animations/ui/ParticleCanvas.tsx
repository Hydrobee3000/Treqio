import { useEffect, useRef } from 'react'

/**
 * Доступные типы анимации частиц.
 */
type ParticleType = 'leaf' | 'dust' | 'dot' | 'ember'

/**
 * Состояние одной частицы в анимации.
 */
interface Particle {
  /** Позиция по X. */
  x: number
  /** Позиция по Y. */
  y: number
  /** Скорость по вертикали (отрицательная у ember — движение вверх). */
  vy: number
  /** Скорость по горизонтали. */
  vx: number
  /** Текущий угол поворота (радианы). */
  rot: number
  /** Скорость вращения. */
  vrot: number
  /** Фаза горизонтального покачивания. */
  sway: number
  /** Скорость изменения фазы покачивания. */
  swaySpeed: number
  /** Размер частицы. */
  size: number
  /** Прозрачность. */
  opacity: number
}

/**
 * Создаёт частицу со случайными параметрами.
 * Ember стартует снизу и движется вверх; остальные — сверху вниз.
 */
function makeParticle(
  width: number,
  height: number,
  type: ParticleType,
  randomY = false,
): Particle {
  const isEmber = type === 'ember'
  return {
    x: Math.random() * width,
    y: randomY
      ? Math.random() * height
      : isEmber
        ? height + 20 + Math.random() * 60
        : -20 - Math.random() * height * 0.5,
    vy: isEmber ? -(0.15 + Math.random() * 0.3) : 0.12 + Math.random() * 0.25,
    vx: -0.15 + Math.random() * 0.3,
    rot: Math.random() * Math.PI * 2,
    vrot: -0.008 + Math.random() * 0.016,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.004 + Math.random() * 0.008,
    size: type === 'dot' || type === 'dust' ? 2 + Math.random() * 3 : 6 + Math.random() * 10,
    opacity: type === 'ember' ? 0.4 + Math.random() * 0.4 : 0.18 + Math.random() * 0.35,
  }
}

/**
 * Читает основной цвет активной темы из CSS-переменной.
 */
function getColor(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() ||
    '#4E7B6A'
  )
}

/**
 * Рисует лист — миндалевидная форма с центральной жилкой.
 */
function drawLeaf(ctx: CanvasRenderingContext2D, p: Particle) {
  const color = getColor()
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -p.size)
  ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.5, 0, p.size)
  ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.7, -p.size * 0.5, 0, -p.size)
  ctx.fill()
  ctx.globalAlpha = p.opacity * 0.4
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(0, -p.size)
  ctx.lineTo(0, p.size)
  ctx.stroke()
  ctx.restore()
}

/**
 * Рисует точку.
 */
function drawDot(ctx: CanvasRenderingContext2D, p: Particle) {
  const color = getColor()
  ctx.save()
  ctx.globalAlpha = p.opacity * 0.6
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/**
 * Рисует пылинку — уменьшенная точка с повышенной прозрачностью.
 */
function drawDust(ctx: CanvasRenderingContext2D, p: Particle) {
  const color = getColor()
  ctx.save()
  ctx.globalAlpha = p.opacity * 0.5
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/**
 * Рисует уголёк — радиальный градиент от цвета к прозрачному.
 */
function drawEmber(ctx: CanvasRenderingContext2D, p: Particle) {
  const color = getColor()
  ctx.save()
  ctx.globalAlpha = p.opacity * 0.7
  const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 0.8)
  grd.addColorStop(0, color)
  grd.addColorStop(1, 'transparent')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/**
 * Количество частиц для каждого типа анимации.
 */
const PARTICLE_COUNT: Record<ParticleType, number> = {
  leaf: 22,
  dust: 40,
  dot: 35,
  ember: 24,
}

/**
 * Свойства компонента анимации.
 */
interface Props {
  /** Тип анимации. */
  type: ParticleType
}

/**
 * Canvas-анимация фона — рендерится поверх страницы с pointer-events: none.
 * Цвет частиц подтягивается из CSS-переменной --color-primary активной темы.
 */
export function ParticleCanvas({ type }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1

    // Синхронизирует разрешение растра canvas с родителем. CSS-размер канваса
    // задан декларативно (width/height: 100% в style ниже) и не зависит от этого
    // расчёта — раньше JS сам выставлял canvas.style.width/height в px по
    // getBoundingClientRect, и при асинхронном срабатывании ResizeObserver
    // мог зафиксировать чуть устаревшее значение, которое торчало за пределы
    // родителя и само увеличивало его scrollHeight — отсюда лишние скроллы.
    // clientWidth/clientHeight — размер padding-box родителя, не зависит от
    // содержимого и не включает влияние самого канваса.
    const resize = () => {
      canvas.width = parent.clientWidth * dpr
      canvas.height = parent.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    const getW = () => canvas.width / dpr
    const getH = () => canvas.height / dpr

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT[type] }, () =>
      makeParticle(getW(), getH(), type, true),
    )

    let raf: number
    const tick = () => {
      const w = getW()
      const h = getH()
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p, i) => {
        p.sway += p.swaySpeed
        p.x += p.vx + Math.sin(p.sway) * 0.3
        p.y += p.vy
        p.rot += p.vrot

        if (type === 'leaf') drawLeaf(ctx, p)
        else if (type === 'dust') drawDust(ctx, p)
        else if (type === 'dot') drawDot(ctx, p)
        else if (type === 'ember') drawEmber(ctx, p)

        // Ember пересекает верхнюю границу, остальные — нижнюю
        const isEmber = type === 'ember'
        const outOfBounds = isEmber ? p.y < -30 : p.y > h + 30
        if (outOfBounds) {
          particles[i] = makeParticle(w, h, type)
        }
      })

      raf = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
