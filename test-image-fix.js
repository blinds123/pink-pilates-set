/**
 * Test script to verify image path fixes
 * Run this in browser console to test all image paths
 */

const testImages = [
    '/images/product/product-01.jpeg',
    '/images/product/product-02.jpeg',
    '/images/product/product-03.jpeg',
    '/images/product/product-04.jpeg',
    '/images/product/product-05.jpeg'
];

async function testImagePaths() {
    console.log('🔍 Testing product image paths...\n');

    let results = {
        success: 0,
        failed: 0,
        details: []
    };

    for (const imagePath of testImages) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            const status = response.ok;

            const result = {
                path: imagePath,
                status: status ? '✅ SUCCESS' : '❌ FAILED',
                statusCode: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type')
            };

            results.details.push(result);

            if (status) {
                results.success++;
                console.log(`${result.status} ${imagePath}`);
                console.log(`   Status: ${response.status} ${response.statusText}`);
                console.log(`   Type: ${result.contentType}\n`);
            } else {
                results.failed++;
                console.log(`${result.status} ${imagePath}`);
                console.log(`   Status: ${response.status} ${response.statusText}\n`);
            }

        } catch (error) {
            results.failed++;
            const result = {
                path: imagePath,
                status: '❌ ERROR',
                error: error.message
            };
            results.details.push(result);
            console.log(`${result.status} ${imagePath}`);
            console.log(`   Error: ${error.message}\n`);
        }
    }

    // Summary
    console.log('📊 Test Results Summary:');
    console.log(`   Total Tests: ${testImages.length}`);
    console.log(`   Successful: ${results.success}`);
    console.log(`   Failed: ${results.failed}`);
    console.log(`   Success Rate: ${((results.success / testImages.length) * 100).toFixed(1)}%\n`);

    if (results.success === testImages.length) {
        console.log('🎉 All images are loading correctly!');
    } else {
        console.log('⚠️  Some images failed to load. Check the paths above.');
    }

    return results;
}

// Auto-run when script is loaded
if (typeof window !== 'undefined') {
    testImagePaths();
} else {
    console.log('This script should be run in a browser environment.');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testImagePaths, testImages };
}