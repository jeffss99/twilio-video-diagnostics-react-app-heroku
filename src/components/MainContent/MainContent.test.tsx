import { act } from 'react-dom/test-utils';
import { ActivePane, useAppStateContext } from '../AppStateProvider/AppStateProvider';
import { ArrowDown } from '../../icons/ArrowDown';
import { ArrowUp } from '../../icons/ArrowUp';
import { Item, MainContent } from './MainContent';
import { MuiThemeProvider } from '@material-ui/core';
import { shallow, mount } from 'enzyme';
import { render } from '@testing-library/react';
import theme from '../../theme';

jest.mock('../AppStateProvider/AppStateProvider');

const mockUseAppStateContext = useAppStateContext as jest.Mock<any>;

describe('the MainContent component', () => {
  it('should set the isActive prop on the active pane', () => {
    mockUseAppStateContext.mockImplementation(() => ({ activePane: 1, setActivePane: jest.fn() }));
    const wrapper = shallow(<MainContent />);
    expect(wrapper.find(Item).at(1).prop('isActive')).toBe(true);
    expect(wrapper.find(Item).find({ isActive: true }).length).toBe(1);
  });

  it('should set the correct props on inactive items', () => {
    mockUseAppStateContext.mockImplementation(() => ({ activePane: 1, setActivePane: jest.fn() }));
    const wrapper = shallow(<MainContent />);
    const item = wrapper.find(Item).at(0).dive();
    expect(item.prop('className')).toContain('inactive');
    expect(item.prop('aria-hidden')).toBe(true);
    expect(item.prop('onClick')).toEqual(expect.any(Function));
  });

  it('should set the correct props on active items', () => {
    mockUseAppStateContext.mockImplementation(() => ({ activePane: 1, setActivePane: jest.fn() }));
    const wrapper = shallow(<MainContent />);
    const item = wrapper.find(Item).at(1).dive();
    expect(item.prop('className')).not.toContain('inactive');
    expect(item.prop('aria-hidden')).toBe(false);
    expect(item.prop('onClick')).toBe(undefined);
  });

  it('should set a new pane as the activePane when it is clicked', () => {
    const mockSetActivePane = jest.fn();
    mockUseAppStateContext.mockImplementation(() => ({ activePane: 1, setActivePane: mockSetActivePane }));
    const wrapper = mount(<MainContent />);
    wrapper.find(Item).at(2).simulate('click');
    expect(mockSetActivePane).toHaveBeenCalledWith(2);
  });

  it('should correctly center the list of Items based on the active pane', () => {
    mockUseAppStateContext.mockImplementation(() => ({ activePane: 0 }));
    const { getAllByTestId, rerender } = render(
      <MuiThemeProvider theme={theme}>
        <MainContent />
      </MuiThemeProvider>
    );

    const div = getAllByTestId('item-container')[1];

    // js-dom doesn't compute heights, so here we must set the properties ourselves
    Object.defineProperties(div, {
      offsetTop: {
        value: 100,
      },
      offsetHeight: {
        value: 119,
      },
    });

    act(() => {
      // Sets a new active pane an rerenders
      mockUseAppStateContext.mockImplementation(() => ({ activePane: 1 }));
      rerender(
        <MuiThemeProvider theme={theme}>
          <MainContent />
        </MuiThemeProvider>
      );
    });

    expect(div.parentElement!.style.transform).toEqual(`translateY(calc(50vh - 159.5px + 50px))`);
  });

  it('should disable the Up button when the first pane is active', () => {
    mockUseAppStateContext.mockImplementation(() => ({ activePane: 0 }));
    const wrapper = shallow(<MainContent />);
    expect(wrapper.find(ArrowUp).parent().prop('disabled')).toBe(true);
    expect(wrapper.find(ArrowDown).parent().prop('disabled')).toBe(false);
  });

  it('should disable the Down button when the last pane is active', () => {
    const numberOfPanes = Object.keys(ActivePane).length / 2;
    mockUseAppStateContext.mockImplementation(() => ({ activePane: numberOfPanes }));
    const wrapper = shallow(<MainContent />);
    expect(wrapper.find(ArrowUp).parent().at(0).prop('disabled')).toBe(false);
    expect(wrapper.find(ArrowDown).parent().prop('disabled')).toBe(true);
  });

  it('should not disable any buttons when the active pane is not the first or last', () => {
    mockUseAppStateContext.mockImplementation(() => ({ activePane: 1 }));
    const wrapper = shallow(<MainContent />);
    expect(wrapper.find(ArrowUp).parent().prop('disabled')).toBe(false);
    expect(wrapper.find(ArrowDown).parent().prop('disabled')).toBe(false);
  });

  it('should decrement the active pane when the Up button is clicked', () => {
    const mockSetActivePane = jest.fn();
    mockUseAppStateContext.mockImplementation(() => ({
      activePane: 1,
      setActivePane: (fn: Function) => mockSetActivePane(fn(1)),
    }));
    const wrapper = mount(<MainContent />);
    wrapper.find(ArrowUp).simulate('click');
    expect(mockSetActivePane).toHaveBeenCalledWith(0);
  });

  it('should increment the active pane when the Down button is clicked', () => {
    const mockSetActivePane = jest.fn();
    mockUseAppStateContext.mockImplementation(() => ({
      activePane: 1,
      setActivePane: (fn: Function) => mockSetActivePane(fn(1)),
    }));
    const wrapper = mount(<MainContent />);
    wrapper.find(ArrowDown).simulate('click');
    expect(mockSetActivePane).toHaveBeenCalledWith(2);
  });
});