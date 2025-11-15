import { render } from '@testing-library/react'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  it('renders with default variant', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('rounded')
    expect(skeleton).toHaveClass('animate-pulse')
    expect(skeleton).toHaveClass('bg-gray-700/50')
  })

  it('renders with circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('rounded-full')
  })

  it('renders with text variant', () => {
    const { container } = render(<Skeleton variant="text" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('h-4')
  })

  it('applies custom width and height', () => {
    const { container } = render(<Skeleton width={100} height={50} />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' })
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('custom-class')
  })
})

