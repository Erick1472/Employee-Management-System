using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace EmployeeManagement.API.Models
{
    public class TimeSpanToStringConverter : JsonConverter<TimeSpan?>
    {
        public override TimeSpan? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.String)
            {
                var str = reader.GetString();
                if (string.IsNullOrEmpty(str)) return null;
                if (TimeSpan.TryParse(str, out var ts))
                    return ts;
            }
            if (reader.TokenType == JsonTokenType.Null)
                return null;
            throw new JsonException($"Cannot convert {reader.GetString()} to TimeSpan");
        }

        public override void Write(Utf8JsonWriter writer, TimeSpan? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value.ToString());
            else
                writer.WriteNullValue();
        }
    }
} 