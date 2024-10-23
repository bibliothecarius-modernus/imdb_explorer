// Mock D3.js
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    append: jest.fn(() => ({
      attr: jest.fn(() => ({
        style: jest.fn(),
        text: jest.fn(),
      })),
    })),
    remove: jest.fn(),
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn(() => ({
      range: jest.fn(),
    })),
  })),
  scaleBand: jest.fn(() => ({
    domain: jest.fn(() => ({
      range: jest.fn(() => ({
        padding: jest.fn(),
      })),
    })),
  })),
  pie: jest.fn(() => jest.fn()),
  arc: jest.fn(() => ({
    innerRadius: jest.fn(() => ({
      outerRadius: jest.fn(),
    })),
  })),
  forceSimulation: jest.fn(() => ({
    force: jest.fn(() => ({
      id: jest.fn(),
    })),
    nodes: jest.fn(),
    on: jest.fn(),
  })),
}));

// Mock flatpickr
jest.mock('flatpickr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    destroy: jest.fn(),
  })),
}));