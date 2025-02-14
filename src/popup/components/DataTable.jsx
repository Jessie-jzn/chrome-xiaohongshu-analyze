import React from "react";

export const DataTable = ({ data }) => {
  if (!data || !data.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">标题</th>
            <th className="px-4 py-2">点赞</th>
            <th className="px-4 py-2">类型</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{item.title}</td>
              <td className="px-4 py-2">{item.likes}</td>
              <td className="px-4 py-2">{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
