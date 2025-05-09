const Joi = require('joi');

const validateUser = (data, isUpdate = false) => {
  const schema = Joi.object({
    nombre: Joi.string()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.empty': 'El nombre es requerido',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 50 caracteres'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'El email es requerido',
        'string.email': 'Por favor ingrese un email válido'
      }),
    password: isUpdate
      ? Joi.string().min(6).allow('').optional()
      : Joi.string().min(6).required()
      .messages({
        'string.empty': 'La contraseña es requerida',
        'string.min': 'La contraseña debe tener al menos 6 caracteres'
      }),
    rol: Joi.string()
      .valid('admin', 'mesero', 'cocinero', 'cajero')
      .required()
      .messages({
        'any.only': 'Rol inválido',
        'string.empty': 'El rol es requerido'
      })
  });

  return schema.validate(data);
};

module.exports = {
  validateUser
};
