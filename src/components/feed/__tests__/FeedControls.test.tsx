import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedControls } from '../FeedControls'

describe('FeedControls', () => {
  const mockOnSortChange = jest.fn()

  beforeEach(() => {
    mockOnSortChange.mockClear()
  })

  it('renders sort dropdown', () => {
    render(<FeedControls sortBy="recent" onSortChange={mockOnSortChange} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays current sort value', () => {
    render(<FeedControls sortBy="popular" onSortChange={mockOnSortChange} />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('popular')
  })

  it('calls onSortChange when sort option changes', async () => {
    const user = userEvent.setup()
    render(<FeedControls sortBy="recent" onSortChange={mockOnSortChange} />)
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'trending')
    
    expect(mockOnSortChange).toHaveBeenCalledWith('trending')
  })

  it('renders all sort options', () => {
    render(<FeedControls sortBy="recent" onSortChange={mockOnSortChange} />)
    const select = screen.getByRole('combobox')
    
    expect(select).toHaveTextContent('Recent')
    expect(select).toHaveTextContent('Popular')
    expect(select).toHaveTextContent('Trending')
  })
})

