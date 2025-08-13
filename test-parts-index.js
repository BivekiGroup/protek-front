// Простой тест Parts Index API
const fetch = require('node-fetch');

const API_KEY = 'PI-E1C0ADB7-E4A8-4960-94A0-4D9C0A074DAE';

async function testPartsIndexAPI() {
  try {
    console.log('🔍 Тестируем Parts Index API...');
    
    // Получаем каталоги
    console.log('\n📦 Получаем список каталогов...');
    const catalogsResponse = await fetch(process.env.PARTSAPI_URL+"/v1/catalogs?lang=ru", {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!catalogsResponse.ok) {
      throw new Error(`HTTP error! status: ${catalogsResponse.status}`);
    }
    
    const catalogsData = await catalogsResponse.json();
    console.log(`✅ Получено ${catalogsData.list.length} каталогов:`);
    catalogsData.list.slice(0, 5).forEach((catalog, index) => {
      console.log(`${index + 1}. ${catalog.name} (ID: ${catalog.id})`);
    });
    
    // Тестируем получение групп для первого каталога
    if (catalogsData.list.length > 0) {
      const firstCatalog = catalogsData.list[0];
      console.log(`\n🎯 Получаем группы для каталога "${firstCatalog.name}"...`);
      
      const groupsResponse = await fetch(
        `${process.env.PARTSAPI_URL}/v1/catalogs/${firstCatalog.id}/groups?lang=ru`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY,
          },
        }
      );
      
      if (groupsResponse.ok) {
        const groupData = await groupsResponse.json();
        console.log(`✅ Получена группа "${groupData.name}"`);
        console.log(`📝 Количество entityNames: ${groupData.entityNames?.length || 0}`);
        
        if (groupData.entityNames && groupData.entityNames.length > 0) {
          console.log('🔗 Первые 5 элементов:');
          groupData.entityNames.slice(0, 5).forEach((entity, index) => {
            console.log(`  ${index + 1}. ${entity.name} (ID: ${entity.id})`);
          });
        }
      } else {
        console.log(`❌ Ошибка получения групп: ${groupsResponse.status}`);
      }
    }
    
    console.log('\n🎉 Тест завершен успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testPartsIndexAPI();