import React from 'react';

const ServiceCard = ({ service }) => {
  return (
    <a href={service.link} className="no-underline block h-full">
      <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50 h-full cursor-pointer transform hover:-translate-y-1">
        <div className="text-4xl mb-6">{service.icon}</div>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">{service.title}</h3>
        <p className="text-gray-600 mb-6">{service.description}</p>
        <ul className="space-y-3">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-gray-600">
              <span className="mr-2 text-green-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 text-right">
          <span className="text-blue-600 font-medium">Learn more →</span>
        </div>
      </div>
    </a>
  );
};

export default ServiceCard; 