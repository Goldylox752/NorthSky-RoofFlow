class PricingEngine {
  constructor() {
    this.baseRate = 100;
    this.markup = 1.2;
  }

  calculate(job = {}) {
    const hours = job.hours || 1;
    const rate = job.rate || this.baseRate;
    const materials = job.materialsCost || 0;

    let total = hours * rate + materials;

    if (job.isUrgent) {
      total *= 1.5;
    }

    total *= this.markup;

    return {
      total,
      breakdown: {
        hours,
        rate,
        materials,
        urgent: !!job.isUrgent
      }
    };
  }
}

const pricingEngine = new PricingEngine();

export default pricingEngine;