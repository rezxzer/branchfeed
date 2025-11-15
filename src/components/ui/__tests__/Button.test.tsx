import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled()
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    let button = screen.getByRole('button', { name: /primary/i })
    expect(button).toHaveClass('bg-gradient-brand')

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('bg-gradient-vip')

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button', { name: /outline/i })
    expect(button).toHaveClass('border-2')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole('button', { name: /small/i })
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="md">Medium</Button>)
    button = screen.getByRole('button', { name: /medium/i })
    expect(button).toHaveClass('px-5', 'py-2.5', 'text-base')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button', { name: /large/i })
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })
})

